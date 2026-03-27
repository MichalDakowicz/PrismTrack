import {
  CreateProjectInput,
  ProjectRecord,
  UpdateProjectInput,
} from "../models/projectPersistence";
import { ProjectRepository } from "./projectRepository";

function nowIso(): string {
  return new Date().toISOString();
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, Map<string, ProjectRecord>>();

  async ensureIndexes(): Promise<void> {
    return;
  }

  async listProjects(workspaceId: string): Promise<ProjectRecord[]> {
    return Array.from(this.store.get(workspaceId)?.values() || []).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async getProjectById(workspaceId: string, projectId: string): Promise<ProjectRecord | null> {
    return this.store.get(workspaceId)?.get(projectId) || null;
  }

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const workspaceProjects = this.ensureWorkspace(input.workspaceId);

    const project: ProjectRecord = {
      id: `project-${Math.random().toString(36).slice(2, 10)}`,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      status: input.status || "active",
      linkedRepositories: input.linkedRepositories || [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    workspaceProjects.set(project.id, project);
    return project;
  }

  async updateProject(
    workspaceId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<ProjectRecord | null> {
    const workspaceProjects = this.store.get(workspaceId);
    if (!workspaceProjects) {
      return null;
    }

    const current = workspaceProjects.get(projectId);
    if (!current) {
      return null;
    }

    const updated: ProjectRecord = {
      ...current,
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      status: input.status ?? current.status,
      linkedRepositories: input.linkedRepositories ?? current.linkedRepositories,
      updatedAt: nowIso(),
    };

    workspaceProjects.set(projectId, updated);
    return updated;
  }

  async deleteProject(workspaceId: string, projectId: string): Promise<boolean> {
    const workspaceProjects = this.store.get(workspaceId);
    if (!workspaceProjects) {
      return false;
    }

    return workspaceProjects.delete(projectId);
  }

  private ensureWorkspace(workspaceId: string): Map<string, ProjectRecord> {
    const existing = this.store.get(workspaceId);
    if (existing) {
      return existing;
    }

    const created = new Map<string, ProjectRecord>();
    this.store.set(workspaceId, created);
    return created;
  }
}
