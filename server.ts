import express from "express";
import { promises as fs } from "fs";
import { createServer as createHttpServer, Server as HttpServer } from "http";
import net from "net";
import path from "path";
import { createServer as createViteServer, ViteDevServer } from "vite";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import { assertDatabaseConfig, getDatabaseConfig } from "./backend/config/database";
import { createMongoConnectionManager } from "./backend/db/mongoConnection";
import {
  CreateProjectInput,
  ProjectRepositoryLinkRecord,
  UpdateProjectInput,
} from "./backend/models/projectPersistence";
import { InMemoryProjectRepository } from "./backend/repositories/inMemoryProjectRepository";
import { MongoProjectRepository } from "./backend/repositories/mongoProjectRepository";
import { ProjectRepository, validateProjectInput } from "./backend/repositories/projectRepository";

dotenv.config();

const DEV_PID_FILE = path.join(process.cwd(), ".prismtrack-dev.pid");

async function isPortFree(port: number, host = "0.0.0.0"): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => {
        resolve(false);
      })
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen({ port, host, exclusive: true });
  });
}

async function findAvailablePort(startPort: number, maxAttempts = 20): Promise<number> {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidate = startPort + offset;
    if (await isPortFree(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No available HMR port found in range ${startPort}-${startPort + maxAttempts - 1}`);
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function terminateProcessGracefully(pid: number): Promise<void> {
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }

  const timeoutMs = 5000;
  const pollMs = 100;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!isProcessRunning(pid)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  if (isProcessRunning(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Ignore if the process exited after the last check.
    }
  }
}

async function cleanupStaleDevProcess(): Promise<void> {
  try {
    const content = await fs.readFile(DEV_PID_FILE, "utf8");
    const previousPid = Number(content.trim());

    if (!Number.isInteger(previousPid) || previousPid <= 0 || previousPid === process.pid) {
      return;
    }

    if (!isProcessRunning(previousPid)) {
      return;
    }

    console.warn(`Detected stale PrismTrack dev process (${previousPid}). Stopping it...`);
    await terminateProcessGracefully(previousPid);
  } catch {
    // Ignore missing/unreadable PID file.
  }
}

async function writeDevPidFile(): Promise<void> {
  await fs.writeFile(DEV_PID_FILE, String(process.pid), "utf8");
}

async function removeDevPidFile(): Promise<void> {
  try {
    const content = await fs.readFile(DEV_PID_FILE, "utf8");
    const current = Number(content.trim());
    if (current !== process.pid) {
      return;
    }
    await fs.unlink(DEV_PID_FILE);
  } catch {
    // Ignore missing/unreadable PID file.
  }
}

function normalizeLinkedRepositories(input: unknown): ProjectRepositoryLinkRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalized: ProjectRepositoryLinkRecord[] = input
    .map((item): ProjectRepositoryLinkRecord | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const repo = item as Record<string, unknown>;
      if (
        typeof repo.id !== "number" ||
        typeof repo.full_name !== "string" ||
        typeof repo.name !== "string"
      ) {
        return null;
      }

      return {
        id: repo.id,
        full_name: repo.full_name,
        name: repo.name,
        html_url: typeof repo.html_url === "string" ? repo.html_url : undefined,
      };
    })
    .filter((repo) => repo !== null);

  const deduped = new Map<string, ProjectRepositoryLinkRecord>();
  normalized.forEach((repo) => {
    deduped.set(repo.full_name, repo);
  });

  return Array.from(deduped.values());
}

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    await cleanupStaleDevProcess();
  }

  const configuredPort = Number(process.env.PORT || 3000);
  const listenPort = isDevelopment ? await findAvailablePort(configuredPort, 30) : configuredPort;
  if (listenPort !== configuredPort) {
    console.warn(`Preferred app port ${configuredPort} is busy. Using ${listenPort} instead.`);
  }

  const appUrl = (process.env.APP_URL || `http://localhost:${listenPort}`).replace(/\/+$/, "");
  const githubCallbackUrl =
    process.env.GITHUB_CALLBACK_URL?.trim() || `${appUrl}/api/auth/github/callback`;
  const databaseConfig = getDatabaseConfig(process.env);
  assertDatabaseConfig(databaseConfig, { isProduction });

  let projectRepository: ProjectRepository;
  const mongoConnectionManager = createMongoConnectionManager(databaseConfig);
  let repositoryMode: "mongodb" | "in-memory" = "in-memory";

  if (databaseConfig.useInMemoryProjectRepo) {
    projectRepository = new InMemoryProjectRepository();
    repositoryMode = "in-memory";
    console.warn("Using in-memory project repository due to USE_IN_MEMORY_PROJECT_REPO=true");
  } else {
    try {
      projectRepository = new MongoProjectRepository(() => mongoConnectionManager.connect());
      await projectRepository.ensureIndexes();
      repositoryMode = "mongodb";
      console.log(`MongoDB connected: ${databaseConfig.dbName}`);
    } catch (error) {
      const canFallback = databaseConfig.allowInMemoryProjectRepoFallback || isDevelopment;
      if (!canFallback || !isDevelopment) {
        throw error;
      }

      console.error("MongoDB bootstrap failed, falling back to in-memory project repository", error);
      projectRepository = new InMemoryProjectRepository();
      repositoryMode = "in-memory";
    }
  }

  await projectRepository.ensureIndexes();

  app.use(express.json());
  app.set("trust proxy", 1);
  app.use(
    cookieSession({
      name: "prismtrack_session",
      keys: [process.env.SESSION_SECRET || "prismtrack-secret-dev"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // Localhost over HTTP cannot persist secure cookies.
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
  );

  // Auth Routes
  app.get("/api/auth/github", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: githubCallbackUrl,
      scope: "repo,user,read:org",
    });
    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: githubCallbackUrl,
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        if (req.session) {
          req.session.github_token = data.access_token;
        }
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. Closing window...</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send("Failed to get access token");
      }
    } catch (error) {
      console.error("OAuth error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.json(null);

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });
      if (!response.ok) {
        if (req.session) {
          req.session = null;
        }
        return res.json(null);
      }
      const user = await response.json();
      if (req.session) {
        req.session.github_login = user.login;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  app.get("/api/health", async (req, res) => {
    const dbHealthy = repositoryMode === "mongodb" ? await mongoConnectionManager.ping() : true;
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? "ok" : "degraded",
      repositoryMode,
      database: {
        connected: repositoryMode === "mongodb" ? mongoConnectionManager.isConnected() : false,
        healthy: dbHealthy,
      },
    });
  });

  app.get("/api/projects", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const workspaceId = req.session?.github_login || "workspace-default";

    try {
      const projects = await projectRepository.listProjects(workspaceId);
      res.json(projects);
    } catch (error) {
      console.error("Failed to list projects", error);
      res.status(500).json({ error: "Failed to list projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const workspaceId = req.session?.github_login || "workspace-default";
    const payload = req.body as {
      name?: string;
      description?: string;
      status?: "planned" | "active" | "archived";
      linkedRepositories?: unknown;
    };

    const linkedRepositories = normalizeLinkedRepositories(payload.linkedRepositories);
    const errors = validateProjectInput({
      name: payload.name,
      status: payload.status,
      linkedRepositories,
    });

    if (!payload.name?.trim()) {
      errors.push("Project name is required.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const input: CreateProjectInput = {
      workspaceId,
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      status: payload.status,
      linkedRepositories,
    };

    try {
      const project = await projectRepository.createProject(input);
      res.status(201).json(project);
    } catch (error) {
      console.error("Failed to create project", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:projectId", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const workspaceId = req.session?.github_login || "workspace-default";
    const projectId = req.params.projectId;
    const payload = req.body as {
      name?: string;
      description?: string;
      status?: "planned" | "active" | "archived";
      linkedRepositories?: unknown;
    };

    const linkedRepositories =
      payload.linkedRepositories === undefined
        ? undefined
        : normalizeLinkedRepositories(payload.linkedRepositories);

    const errors = validateProjectInput({
      name: payload.name,
      status: payload.status,
      linkedRepositories,
    });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const input: UpdateProjectInput = {
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      status: payload.status,
      linkedRepositories,
    };

    try {
      const updated = await projectRepository.updateProject(workspaceId, projectId, input);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Failed to update project", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:projectId", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const workspaceId = req.session?.github_login || "workspace-default";
    const projectId = req.params.projectId;

    try {
      const deleted = await projectRepository.deleteProject(workspaceId, projectId);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete project", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // GitHub API Routes
  app.get("/api/github/repos", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });
      const repos = await response.json();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.get("/api/github/issues", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { repo } = req.query;
    let url = "https://api.github.com/issues?filter=all&state=all&sort=updated&per_page=50";
    if (repo) {
      url = `https://api.github.com/repos/${repo}/issues?state=all&sort=updated&per_page=50`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });
      const issues = await response.json();
      // Filter out pull requests as GitHub API returns them in issues endpoint
      const filteredIssues = Array.isArray(issues) ? issues.filter((i: any) => !i.pull_request) : issues;
      res.json(filteredIssues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  app.get("/api/github/pulls", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      // Fetching PRs for the user (created by them or assigned)
      const response = await fetch("https://api.github.com/search/issues?q=is:pr+author:@me+archived:false+is:open", {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });
      const data = await response.json();
      res.json(data.items || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pull requests" });
    }
  });

  app.get("/api/github/branches", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { repo } = req.query;
    const repos = repo ? [repo as string] : [];

    if (repos.length === 0) {
      return res.status(400).json({ error: "Repository is required" });
    }

    const allBranches: any[] = [];

    for (const fullName of repos) {
      try {
        const branchesResponse = await fetch(
          `https://api.github.com/repos/${fullName}/branches?per_page=100`,
          {
            headers: {
              Authorization: `token ${token}`,
              "User-Agent": "PrismTrack",
            },
          }
        );

        if (!branchesResponse.ok) {
          console.error(`Failed to fetch branches for ${fullName}: ${branchesResponse.status}`);
          continue;
        }

        const branches = await branchesResponse.json();

        const branchesWithAuthor = await Promise.all(
          branches.map(async (branch: any) => {
            try {
              const commitResponse = await fetch(branch.commit.url, {
                headers: {
                  Authorization: `token ${token}`,
                  "User-Agent": "PrismTrack",
                },
              });

              if (commitResponse.ok) {
                const commit = await commitResponse.json();
                return {
                  ...branch,
                  author: {
                    login: commit.author?.login || commit.commit?.author?.name || "unknown",
                    avatar_url: commit.author?.avatar_url || "",
                  },
                  lastCommitDate: commit.commit?.author?.date || new Date().toISOString(),
                };
              }
            } catch {
              // Fallback to basic data
            }
            return {
              ...branch,
              author: { login: "unknown", avatar_url: "" },
              lastCommitDate: new Date().toISOString(),
            };
          })
        );

        branchesWithAuthor.forEach((branch) => {
          allBranches.push({
            name: branch.name,
            commit: {
              sha: branch.commit.sha,
              url: branch.commit.url,
            },
            protected: branch.protected,
            protection_url: branch.protection_url,
            lastCommitDate: branch.lastCommitDate,
            author: branch.author,
            pullRequest: undefined,
            repository: {
              full_name: fullName,
              name: fullName.split("/")[1],
            },
          });
        });
      } catch (error) {
        console.error(`Error fetching branches for ${fullName}:`, error);
      }
    }

    allBranches.sort((a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime());

    res.json(allBranches);
  });

  app.post("/api/github/issues", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { repo, title, body, labels, assignees } = req.body;
    if (!repo || !title) return res.status(400).json({ error: "Repo and title are required" });

    try {
      const requestBody: { title: string; body?: string; labels?: string[]; assignees?: string[] } = { title, body };
      if (labels && Array.isArray(labels) && labels.length > 0) {
        requestBody.labels = labels;
      }
      if (assignees && Array.isArray(assignees) && assignees.length > 0) {
        requestBody.assignees = assignees;
      }

      const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 403 || response.status === 404) {
        const error = await response.json();
        console.log("GitHub error response:", error);
        return res.status(response.status).json({ error: error.message || error.error || `GitHub error: ${response.status}` });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to create issue" });
      }

      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to create issue" });
    }
  });

  app.get("/api/github/repos/:owner/:repo/labels", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo } = req.params;

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/labels`, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });

      if (response.status === 404) {
        return res.status(404).json({ error: "Repository not found" });
      }

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to fetch labels" });
      }

      const labels = await response.json();
      res.json(labels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch labels" });
    }
  });

  app.get("/api/github/repos/:owner/:repo/assignees", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo } = req.params;

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/assignees`, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });

      if (response.status === 404) {
        return res.status(404).json({ error: "Repository not found" });
      }

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to fetch assignees" });
      }

      const assignees = await response.json();
      res.json(assignees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignees" });
    }
  });

  app.patch("/api/github/issues/:owner/:repo/:issueNumber", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo, issueNumber } = req.params;
    const { state, title, body } = req.body;

    if (!state && !title && body === undefined) {
      return res.status(400).json({ error: "At least one field (state, title, or body) is required" });
    }

    if (state && !["open", "closed"].includes(state)) {
      return res.status(400).json({ error: "State must be 'open' or 'closed'" });
    }

    const updateData: Record<string, unknown> = {};
    if (state) updateData.state = state;
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to update issue" });
      }

      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to update issue" });
    }
  });

  app.patch("/api/github/issues/:owner/:repo/:issueNumber/labels", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo, issueNumber } = req.params;
    const { labels } = req.body;

    if (!labels || !Array.isArray(labels)) {
      return res.status(400).json({ error: "Labels must be an array" });
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ labels }),
      });

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to update labels" });
      }

      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to update labels" });
    }
  });

  app.post("/api/github/repos/:owner/:repo/issues/:issueNumber/assignees", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo, issueNumber } = req.params;
    const { assignees } = req.body;

    if (!assignees || !Array.isArray(assignees)) {
      return res.status(400).json({ error: "Assignees must be an array" });
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/assignees`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignees }),
      });

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to add assignees" });
      }

      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to add assignees" });
    }
  });

  app.delete("/api/github/repos/:owner/:repo/issues/:issueNumber/assignees", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo, issueNumber } = req.params;
    const { assignees } = req.body;

    if (!assignees || !Array.isArray(assignees)) {
      return res.status(400).json({ error: "Assignees must be an array" });
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/assignees`, {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignees }),
      });

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
        if (rateLimitRemaining === "0") {
          return res.status(403).json({ error: "GitHub API rate limit exceeded. Please try again later." });
        }
        const error = await response.json();
        return res.status(403).json({ error: error.message || "Access forbidden" });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.message || "Failed to remove assignees" });
      }

      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove assignees" });
    }
  });

  app.delete("/api/github/issues/:owner/:repo/:issueNumber", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { owner, repo, issueNumber } = req.params;

    try {
      // First, get the issue to find its ID
      const getIssueResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
        },
      });

      if (!getIssueResponse.ok) {
        const error = await getIssueResponse.json();
        return res.status(getIssueResponse.status).json({ error: error.message || "Failed to fetch issue" });
      }

      const issue = await getIssueResponse.json();

      // Use GraphQL API to delete the issue
      const deleteResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "PrismTrack",
        },
        body: JSON.stringify({
          query: `
            mutation DeleteIssue($issueId: ID!) {
              deleteIssue(input: { issueId: $issueId }) {
                clientMutationId
              }
            }
          `,
          variables: {
            issueId: issue.node_id,
          },
        }),
      });

      const deleteData = await deleteResponse.json();

      if (deleteData.errors) {
        const errorMessage = deleteData.errors[0]?.message || "Failed to delete issue";
        // Check if it's a permission issue
        if (errorMessage.includes("not allowed") || errorMessage.includes("admin")) {
          return res.status(403).json({ error: "You need admin permissions to delete issues. Only repository admins can delete issues." });
        }
        return res.status(403).json({ error: errorMessage });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete issue" });
    }
  });

  // GitHub Webhook Endpoint
  app.post("/api/webhook/github", (req, res) => {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`Received GitHub webhook event: ${event}`);
    
    // In a real multi-user app, we would use WebSockets to broadcast this
    // to connected clients. For now, we log the activity.
    if (event === "issues") {
      console.log(`Issue ${payload.action}: ${payload.issue.title}`);
    } else if (event === "pull_request") {
      console.log(`PR ${payload.action}: ${payload.pull_request.title}`);
    }

    res.status(200).send("Webhook received");
  });

  const server: HttpServer = createHttpServer(app);

  let vite: ViteDevServer | undefined;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
          host: "localhost",
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(listenPort, "0.0.0.0", async () => {
    if (isDevelopment) {
      await writeDevPidFile();
    }
    console.log(`Server running on http://localhost:${listenPort}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);

    try {
      if (vite) {
        await vite.close();
      }
    } catch (error) {
      console.error("Error closing Vite server:", error);
    }

    try {
      await mongoConnectionManager.close();
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    if (isDevelopment) {
      await removeDevPidFile();
    }

    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

startServer();
