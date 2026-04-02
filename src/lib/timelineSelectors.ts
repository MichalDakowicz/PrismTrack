import { Issue, PullRequest } from "../types";
import {
  filterIssuesByProject,
  filterPullRequestsByProject,
  getRepositoryFullName,
} from "./projectSelectors";
import { Project } from "../types";

export type TimelineGranularity = "day" | "week" | "month";
export type TimelineStateFilter = "all" | "open" | "closed" | "merged";

export interface TimelineFilters {
  state: TimelineStateFilter;
  assignee: string;
  repository: string;
}

export interface TimelineItem {
  id: string;
  type: "issue" | "pull-request";
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  userLogin: string;
  assignees: string[];
  repositoryFullName: string;
  startAt: string;
  endAt: string;
  deadlineAt?: string;
  htmlUrl: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toStartDateIso(dateOnly?: string): string | undefined {
  if (!dateOnly) {
    return undefined;
  }
  return `${dateOnly}T00:00:00.000Z`;
}

function toEndDateIso(dateOnly?: string): string | undefined {
  if (!dateOnly) {
    return undefined;
  }
  return `${dateOnly}T23:59:59.999Z`;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function bucketRange(date: Date, granularity: TimelineGranularity): { start: Date; end: Date; key: string; label: string } {
  if (granularity === "day") {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return {
      start,
      end,
      key: toIsoDate(start),
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    };
  }

  if (granularity === "week") {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return {
      start,
      end,
      key: `${toIsoDate(start)}_week`,
      label: `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    };
  }

  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    start,
    end,
    key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    label: start.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
  };
}

export function normalizeTimelineItems(
  issues: Issue[],
  pullRequests: PullRequest[],
  project: Project | null,
): TimelineItem[] {
  const scopedIssues = filterIssuesByProject(issues, project);
  const scopedPrs = filterPullRequestsByProject(pullRequests, project);

  const issueItems = scopedIssues
    .map((issue): TimelineItem | null => {
      const repositoryFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
      if (!repositoryFullName) {
        return null;
      }

      return {
        id: `issue-${issue.id}`,
        type: "issue" as const,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        userLogin: issue.user.login,
        assignees: (issue.assignees || []).map((assignee) => assignee.login),
        repositoryFullName,
        startAt: toStartDateIso(issue.prismtrackDates?.startDate) || issue.created_at,
        endAt: toEndDateIso(issue.prismtrackDates?.endDate) || issue.closed_at || issue.updated_at,
        deadlineAt: toEndDateIso(issue.prismtrackDates?.dueDate) || issue.milestone?.due_on || undefined,
        htmlUrl: issue.html_url,
      };
    })
    .filter((item): item is TimelineItem => item !== null);

  const prItems = scopedPrs
    .map((pr): TimelineItem | null => {
      const repositoryFullName = pr.repository?.full_name || getRepositoryFullName(pr.repository_url);
      if (!repositoryFullName) {
        return null;
      }

      const state: "open" | "closed" | "merged" = pr.merged_at ? "merged" : pr.state;

      return {
        id: `pr-${pr.id}`,
        type: "pull-request" as const,
        number: pr.number,
        title: pr.title,
        state,
        userLogin: pr.user.login,
        assignees: [pr.user.login],
        repositoryFullName,
        startAt: pr.created_at,
        endAt: pr.merged_at || pr.updated_at,
        htmlUrl: pr.html_url,
      };
    })
    .filter((item): item is TimelineItem => item !== null);

  return [...issueItems, ...prItems].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

export function applyTimelineFilters(
  items: TimelineItem[],
  filters: TimelineFilters,
  rangeStart: Date,
  rangeEnd: Date,
): TimelineItem[] {
  const start = startOfDay(rangeStart).getTime();
  const end = endOfDay(rangeEnd).getTime();
  const repositoryNeedle = filters.repository.toLowerCase();
  const assigneeNeedle = filters.assignee.toLowerCase();

  return items.filter((item) => {
    const itemStart = new Date(item.startAt).getTime();
    const itemEnd = new Date(item.endAt).getTime();
    const inDateRange = itemEnd >= start && itemStart <= end;
    const stateMatch = filters.state === "all" || item.state === filters.state;
    const repositoryMatch =
      repositoryNeedle.length === 0 || item.repositoryFullName.toLowerCase().includes(repositoryNeedle);
    const assigneeMatch =
      assigneeNeedle.length === 0 ||
      item.assignees.some((assignee) => assignee.toLowerCase().includes(assigneeNeedle));

    return inDateRange && stateMatch && repositoryMatch && assigneeMatch;
  }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function defaultRangeEnd(): Date {
  return endOfDay(new Date());
}

export function defaultRangeStart(daysBack = 30): Date {
  const end = defaultRangeEnd();
  return startOfDay(new Date(end.getTime() - (daysBack - 1) * DAY_MS));
}
