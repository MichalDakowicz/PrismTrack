import { Issue, PullRequest } from "../types";

export type ActivityEventType =
  | "issue_opened"
  | "issue_closed"
  | "issue_updated"
  | "pr_opened"
  | "pr_merged"
  | "pr_closed"
  | "branch_activity";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  actor: string;
  repo: string;
  timestamp: string;
  url: string;
}

export type DateRangeFilter = "7d" | "30d" | "90d" | "365d" | "all";

export const ACTIVITY_EVENT_LABELS: Record<ActivityEventType, string> = {
  issue_opened: "Issue opened",
  issue_closed: "Issue closed",
  issue_updated: "Issue updated",
  pr_opened: "Pull request opened",
  pr_merged: "Pull request merged",
  pr_closed: "Pull request closed",
  branch_activity: "Branch activity",
};

export function getDateRangeCutoff(filter: DateRangeFilter): number | null {
  if (filter === "all") {
    return null;
  }

  const now = new Date();
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : filter === "90d" ? 90 : 365;
  now.setDate(now.getDate() - days);
  return now.getTime();
}

export function buildBranchEvents(branches: any[]): ActivityEvent[] {
  return branches.map((branch: any) => ({
    id: `branch-${branch.repository?.full_name || "unknown"}-${branch.name}`,
    type: "branch_activity",
    title: branch.name,
    actor: branch.author?.login || "unknown",
    repo: branch.repository?.full_name || "unknown",
    timestamp: branch.lastCommitDate || new Date().toISOString(),
    url: `https://github.com/${branch.repository?.full_name || ""}/tree/${branch.name}`,
  }));
}

export function buildIssueEvents(issues: Issue[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  issues.forEach((issue) => {
    const repo = issue.repository?.full_name || "unknown";
    events.push({
      id: `issue-open-${issue.id}`,
      type: "issue_opened",
      title: issue.title,
      actor: issue.user.login,
      repo,
      timestamp: issue.created_at,
      url: issue.html_url,
    });

    if (issue.closed_at) {
      events.push({
        id: `issue-close-${issue.id}`,
        type: "issue_closed",
        title: issue.title,
        actor: issue.user.login,
        repo,
        timestamp: issue.closed_at,
        url: issue.html_url,
      });
    }

    if (issue.updated_at && issue.updated_at !== issue.created_at && issue.updated_at !== issue.closed_at) {
      events.push({
        id: `issue-update-${issue.id}`,
        type: "issue_updated",
        title: issue.title,
        actor: issue.user.login,
        repo,
        timestamp: issue.updated_at,
        url: issue.html_url,
      });
    }
  });

  return events;
}

export function buildPullRequestEvents(pullRequests: PullRequest[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  pullRequests.forEach((pr) => {
    const repo = pr.repository?.full_name || "unknown";
    events.push({
      id: `pr-open-${pr.id}`,
      type: "pr_opened",
      title: pr.title,
      actor: pr.user.login,
      repo,
      timestamp: pr.created_at,
      url: pr.html_url,
    });

    if (pr.merged_at) {
      events.push({
        id: `pr-merge-${pr.id}`,
        type: "pr_merged",
        title: pr.title,
        actor: pr.user.login,
        repo,
        timestamp: pr.merged_at,
        url: pr.html_url,
      });
    } else if (pr.closed_at) {
      events.push({
        id: `pr-close-${pr.id}`,
        type: "pr_closed",
        title: pr.title,
        actor: pr.user.login,
        repo,
        timestamp: pr.closed_at,
        url: pr.html_url,
      });
    }
  });

  return events;
}

export function filterActivityEvents(
  events: ActivityEvent[],
  eventTypeFilter: ActivityEventType | "all",
  repoFilter: string,
  authorFilter: string,
  dateRangeFilter: DateRangeFilter
): ActivityEvent[] {
  const cutoff = getDateRangeCutoff(dateRangeFilter);

  return events.filter((event) => {
    if (eventTypeFilter !== "all" && event.type !== eventTypeFilter) {
      return false;
    }
    if (repoFilter !== "all" && event.repo !== repoFilter) {
      return false;
    }
    if (authorFilter !== "all" && event.actor !== authorFilter) {
      return false;
    }
    if (cutoff !== null && new Date(event.timestamp).getTime() < cutoff) {
      return false;
    }

    return true;
  });
}