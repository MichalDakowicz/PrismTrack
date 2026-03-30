import { Issue, Project, PullRequest } from "../types";

export function getRepositoryFullName(resourceUrl?: string): string | null {
  if (!resourceUrl) {
    return null;
  }

  const marker = "/repos/";
  const markerIndex = resourceUrl.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const path = resourceUrl.slice(markerIndex + marker.length);
  const [owner, repo] = path.split("/");
  if (!owner || !repo) {
    return null;
  }

  return `${owner}/${repo}`;
}

function linkedRepositorySet(project: Project | null): Set<string> {
  if (!project) {
    return new Set();
  }

  return new Set(project.linkedRepositories.map((repo) => repo.full_name));
}

export function filterIssuesByProject(issues: Issue[], project: Project | null): Issue[] {
  if (!project) {
    return issues;
  }

  const linked = linkedRepositorySet(project);
  if (linked.size === 0) {
    return [];
  }

  return issues.filter((issue) => {
    const fullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    return !!fullName && linked.has(fullName);
  });
}

export function filterPullRequestsByProject(prs: PullRequest[], project: Project | null): PullRequest[] {
  if (!project) {
    return prs;
  }

  const linked = linkedRepositorySet(project);
  if (linked.size === 0) {
    return [];
  }

  return prs.filter((pr) => {
    const fullName = pr.repository?.full_name || getRepositoryFullName(pr.repository_url);
    return !!fullName && linked.has(fullName);
  });
}

export function hasLinkedRepositories(project: Project | null): boolean {
  return !!project && project.linkedRepositories.length > 0;
}
