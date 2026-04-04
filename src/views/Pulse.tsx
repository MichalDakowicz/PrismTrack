import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Issue, PullRequest } from "../types";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, filterPullRequestsByProject, hasLinkedRepositories } from "../lib/projectSelectors";
import {
  BranchActivityPoint,
  DateRange,
  PulseGrouping,
  PulseMetric,
  buildDateKeys,
  buildPulseRows,
  getGlobalPulseMax,
} from "../lib/pulse";
import { PulseControls } from "../components/pulse/PulseControls";
import { PulseHeatmap } from "../components/pulse/PulseHeatmap";

export function Pulse() {
  const { activeProject } = useProjects();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [branchPoints, setBranchPoints] = useState<BranchActivityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [metric, setMetric] = useState<PulseMetric>("composite");
  const [grouping, setGrouping] = useState<PulseGrouping>("team");
  const [dateRange, setDateRange] = useState<DateRange>("90d");

  const refresh = async () => {
    if (!activeProject || !hasLinkedRepositories(activeProject)) {
      setIssues([]);
      setPullRequests([]);
      setBranchPoints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [issuesRes, pullsRes, branchesByRepo] = await Promise.all([
        fetch("/api/github/issues"),
        fetch("/api/github/pulls"),
        Promise.all(
          activeProject.linkedRepositories.map((repo) =>
            fetch(`/api/github/branches?repo=${encodeURIComponent(repo.full_name)}`).then(async (response) =>
              response.ok ? response.json() : []
            )
          )
        ),
      ]);

      const issuesData = issuesRes.ok ? await issuesRes.json() : [];
      const pullsData = pullsRes.ok ? await pullsRes.json() : [];

      setIssues(filterIssuesByProject(issuesData, activeProject));
      setPullRequests(filterPullRequestsByProject(pullsData, activeProject));

      const flattened = branchesByRepo.flat();
      setBranchPoints(
        flattened.map((branch: any) => ({
          author: branch.author?.login || "unknown",
          date: branch.lastCommitDate || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to load pulse data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [activeProject?.id]);

  const dayKeys = useMemo(() => buildDateKeys(dateRange), [dateRange]);

  const rows = useMemo(
    () => buildPulseRows(dayKeys, grouping, metric, issues, pullRequests, branchPoints),
    [branchPoints, dayKeys, grouping, issues, metric, pullRequests]
  );

  const globalMax = useMemo(() => getGlobalPulseMax(rows), [rows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" role="status" aria-label="Loading pulse">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeProject && !hasLinkedRepositories(activeProject)) {
    return (
      <div className="p-8">
        <div className="border border-dashed border-border p-8 text-center bg-surface">
          <h3 className="text-lg font-medium text-text-main">No linked repositories</h3>
          <p className="text-sm text-text-dim mt-2">
            Link repositories to {activeProject.name} from the Projects page to view pulse metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Pulse</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border">
              {dayKeys.length} days
            </span>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-surface-hover text-sm font-mono text-text-main hover:bg-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <PulseControls
          metric={metric}
          grouping={grouping}
          dateRange={dateRange}
          onMetricChange={setMetric}
          onGroupingChange={setGrouping}
          onDateRangeChange={setDateRange}
        />
      </header>

      <div className="flex-1 overflow-auto p-6">
        <PulseHeatmap rows={rows} globalMax={globalMax} />
      </div>
    </div>
  );
}