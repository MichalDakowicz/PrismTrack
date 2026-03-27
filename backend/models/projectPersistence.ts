export type ProjectStatus = "planned" | "active" | "archived";

export interface ProjectRepositoryLinkRecord {
  id: number;
  full_name: string;
  name: string;
  html_url?: string;
}

export interface ProjectRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  linkedRepositories: ProjectRepositoryLinkRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  workspaceId: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  linkedRepositories?: ProjectRepositoryLinkRecord[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  linkedRepositories?: ProjectRepositoryLinkRecord[];
}
