import { Issue, PullRequest } from "../types";

export type PulseMetric = "composite" | "commits" | "issues_closed" | "prs_merged";
export type PulseGrouping = "team" | "contributors";
export type DateRange = "90d" | "180d" | "365d";

export interface BranchActivityPoint {
  author: string;
  date: string;
}

export interface HeatCell {
  dayKey: string;
  count: number;
}

export interface PulseRow {
  name: string;
  cells: HeatCell[];
  max: number;
  total: number;
}

export function formatDayKey(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDateKeys(range: DateRange): string[] {
  const days = range === "90d" ? 90 : range === "180d" ? 180 : 365;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    keys.push(formatDayKey(date));
  }

  return keys;
}

export function intensityClass(count: number, max: number): string {
  if (max <= 0 || count <= 0) {
    return "bg-surface-hover";
  }

  const ratio = count / max;
  if (ratio >= 0.75) {
    return "bg-primary";
  }
  if (ratio >= 0.5) {
    return "bg-primary/70";
  }
  if (ratio >= 0.25) {
    return "bg-primary/45";
  }
  return "bg-primary/25";
}

export function buildPulseRows(
  dayKeys: string[],
  grouping: PulseGrouping,
  metric: PulseMetric,
  issues: Issue[],
  pullRequests: PullRequest[],
  branchPoints: BranchActivityPoint[]
): PulseRow[] {
  const startKey = dayKeys[0];
  const endKey = dayKeys[dayKeys.length - 1];

  const contributors = new Set<string>();
  const bucket = new Map<string, Map<string, number>>();

  const increment = (rowId: string, dateValue: string | undefined | null, count = 1) => {
    if (!dateValue) {
      return;
    }

    const dayKey = formatDayKey(dateValue);
    if (dayKey < startKey || dayKey > endKey) {
      return;
    }

    const row = bucket.get(rowId) || new Map<string, number>();
    row.set(dayKey, (row.get(dayKey) || 0) + count);
    bucket.set(rowId, row);
    contributors.add(rowId);
  };

  if (metric === "composite" || metric === "issues_closed") {
    issues.forEach((issue) => {
      if (issue.closed_at) {
        increment(issue.user.login, issue.closed_at);
      }
    });
  }

  if (metric === "composite" || metric === "prs_merged") {
    pullRequests.forEach((pr) => {
      if (pr.merged_at) {
        increment(pr.user.login, pr.merged_at);
      }
    });
  }

  if (metric === "composite" || metric === "commits") {
    branchPoints.forEach((point) => {
      increment(point.author, point.date);
    });
  }

  let scoped = new Map<string, Map<string, number>>();

  if (grouping === "team") {
    const merged = new Map<string, number>();
    bucket.forEach((row) => {
      row.forEach((value, day) => {
        merged.set(day, (merged.get(day) || 0) + value);
      });
    });

    scoped = new Map<string, Map<string, number>>([["Team", merged]]);
  } else {
    const sortedContributors = Array.from(contributors).sort((a, b) => {
      const aTotal = Array.from(bucket.get(a)?.values() || []).reduce((sum, value) => sum + value, 0);
      const bTotal = Array.from(bucket.get(b)?.values() || []).reduce((sum, value) => sum + value, 0);
      return bTotal - aTotal;
    });

    const limited = sortedContributors.slice(0, 8);
    scoped = new Map(limited.map((contributor) => [contributor, bucket.get(contributor) || new Map<string, number>()]));
  }

  return Array.from(scoped.entries()).map(([name, counts]) => {
    const cells: HeatCell[] = dayKeys.map((dayKey) => ({ dayKey, count: counts.get(dayKey) || 0 }));
    const max = cells.reduce((current, cell) => Math.max(current, cell.count), 0);
    const total = cells.reduce((sum, cell) => sum + cell.count, 0);
    return { name, cells, max, total };
  });
}

export function getGlobalPulseMax(rows: PulseRow[]): number {
  return rows.reduce((current, row) => Math.max(current, row.max), 0);
}
