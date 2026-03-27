import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV !== "production";
  const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
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
      const db = await mongoConnectionManager.connect();
      projectRepository = new MongoProjectRepository(db);
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

  app.post("/api/github/issues", async (req, res) => {
    const token = req.session?.github_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { repo, title, body } = req.body;
    if (!repo || !title) return res.status(400).json({ error: "Repo and title are required" });

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "PrismTrack",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });
      const issue = await response.json();
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to create issue" });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const hmrPort = Number(process.env.VITE_HMR_PORT || 24679);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          host: "localhost",
          port: hmrPort,
          clientPort: hmrPort,
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    try {
      await mongoConnectionManager.close();
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
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
