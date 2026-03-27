import { CreateProjectInput, ProjectRecord, UpdateProjectInput } from "../models/projectPersistence";

export interface ProjectRepository {
  ensureIndexes: () => Promise<void>;
  listProjects: (workspaceId: string) => Promise<ProjectRecord[]>;
  getProjectById: (workspaceId: string, projectId: string) => Promise<ProjectRecord | null>;
  createProject: (input: CreateProjectInput) => Promise<ProjectRecord>;
  updateProject: (workspaceId: string, projectId: string, input: UpdateProjectInput) => Promise<ProjectRecord | null>;
  deleteProject: (workspaceId: string, projectId: string) => Promise<boolean>;
}

function isStatus(value: string): boolean {
  return ["planned", "active", "archived"].includes(value);
}

export function validateProjectInput(input: {
  name?: string;
  linkedRepositories?: { id?: number; full_name?: string; name?: string }[];
  status?: string;
}): string[] {
  const errors: string[] = [];

  if (input.name !== undefined && !input.name.trim()) {
    errors.push("Project name cannot be empty.");
  }

  if (input.status !== undefined && !isStatus(input.status)) {
    errors.push("Project status must be planned, active, or archived.");
  }

  if (input.linkedRepositories) {
    input.linkedRepositories.forEach((repo, index) => {
      if (typeof repo.id !== "number") {
        errors.push(`linkedRepositories[${index}].id must be a number.`);
      }
      if (!repo.full_name || !repo.name) {
        errors.push(`linkedRepositories[${index}] requires full_name and name.`);
      }
    });
  }

  return errors;
}
