export interface User {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  user: User;
  labels: Label[];
  created_at: string;
  updated_at: string;
  html_url: string;
  repository_url?: string;
  repository?: Repository;
  pull_request?: any;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  user: User;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
  repository_url?: string;
  repository?: Repository;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: User;
  private: boolean;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
}

export type ProjectStatus = "planned" | "active" | "archived";

export interface ProjectRepositoryLink {
  id: number;
  full_name: string;
  name: string;
  html_url?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  linkedRepositories: ProjectRepositoryLink[];
  createdAt: string;
  updatedAt: string;
}

export interface BranchUser {
  login: string;
  avatar_url: string;
}

export interface Branch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
  protection_url?: string;
  lastCommitDate: string;
  author: BranchUser;
  pullRequest?: { number: number; state: string; url: string };
  repository: { full_name: string; name: string };
}
