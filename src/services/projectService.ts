import { Project, Repository } from "../types";

export interface ProjectCreateInput {
  name: string;
  description?: string;
  repositoryIds?: number[];
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: Project["status"];
  repositoryIds?: number[];
}

export interface ProjectService {
  listProjects(): Promise<Project[]>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateProject(projectId: string, input: ProjectUpdateInput): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
}

const nowIso = () => new Date().toISOString();

const toLink = (repo: Repository) => ({
  id: repo.id,
  full_name: repo.full_name,
  name: repo.name,
  html_url: repo.html_url,
});

function mapRepositoryIdsToLinks(input: { repositoryIds?: number[] }, repositories: Repository[]) {
  return repositories
    .filter((repo) => (input.repositoryIds || []).includes(repo.id))
    .map(toLink);
}

export function createInMemoryProjectService(repositories: Repository[]): ProjectService {
  let projects: Project[] = [];

  return {
    async listProjects() {
      return projects;
    },

    async createProject(input) {
      const selectedRepos = mapRepositoryIdsToLinks(input, repositories);

      const project: Project = {
        id: `project-${Math.random().toString(36).slice(2, 10)}`,
        name: input.name,
        description: input.description,
        status: "active",
        linkedRepositories: selectedRepos,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      projects = [project, ...projects];
      return project;
    },

    async updateProject(projectId, input) {
      const selectedRepos = input.repositoryIds
        ? mapRepositoryIdsToLinks(input, repositories)
        : undefined;

      let updatedProject: Project | null = null;
      projects = projects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        updatedProject = {
          ...project,
          name: input.name ?? project.name,
          description: input.description ?? project.description,
          status: input.status ?? project.status,
          linkedRepositories: selectedRepos ?? project.linkedRepositories,
          updatedAt: nowIso(),
        };

        return updatedProject;
      });

      if (!updatedProject) {
        throw new Error("Project not found");
      }

      return updatedProject;
    },

    async deleteProject(projectId) {
      const before = projects.length;
      projects = projects.filter((project) => project.id !== projectId);
      if (projects.length === before) {
        throw new Error("Project not found");
      }
    },
  };
}

export function createApiProjectService(repositories: Repository[]): ProjectService {
  return {
    async listProjects() {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }
      return response.json();
    },

    async createProject(input) {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          linkedRepositories: mapRepositoryIdsToLinks(input, repositories),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return response.json();
    },

    async updateProject(projectId, input) {
      const payload: Record<string, unknown> = {
        name: input.name,
        description: input.description,
        status: input.status,
      };

      if (input.repositoryIds !== undefined) {
        payload.linkedRepositories = mapRepositoryIdsToLinks(input, repositories);
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return response.json();
    },

    async deleteProject(projectId) {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
    },
  };
}
