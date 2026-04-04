import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Issue, PullRequest } from "../types";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, filterPullRequestsByProject, hasLinkedRepositories } from "../lib/projectSelectors";
import {
  ActivityEvent,
  ActivityEventType,
  DateRangeFilter,
  buildBranchEvents,
  buildIssueEvents,
  buildPullRequestEvents,
  filterActivityEvents,
} from "../lib/activityFeed";
import { ActivityFeedFilters } from "../components/activity/ActivityFeedFilters";
import { ActivityFeedEventList } from "../components/activity/ActivityFeedEventList";

export function ActivityFeed() {
  const { activeProject } = useProjects();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [branchActivity, setBranchActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<ActivityEventType | "all">("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("30d");

  const refreshData = async () => {
    if (!activeProject || !hasLinkedRepositories(activeProject)) {
      setIssues([]);
      setPullRequests([]);
      setBranchActivity([]);
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
      const flattenedBranches = branchesByRepo.flat();

      const scopedIssues = filterIssuesByProject(issuesData, activeProject);
      const scopedPulls = filterPullRequestsByProject(pullsData, activeProject);

      setIssues(scopedIssues);
      setPullRequests(scopedPulls);
      setBranchActivity(buildBranchEvents(flattenedBranches));
    } catch (error) {
      console.error("Failed to load activity feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeProject?.id]);

  const events = useMemo(() => {
    const issueEvents = buildIssueEvents(issues);
    const prEvents = buildPullRequestEvents(pullRequests);

    return [...issueEvents, ...prEvents, ...branchActivity].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [issues, pullRequests, branchActivity]);

  const repos = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.repo))).sort();
  }, [events]);

  const authors = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.actor))).sort();
  }, [events]);

  const filteredEvents = useMemo(
    () => filterActivityEvents(events, eventTypeFilter, repoFilter, authorFilter, dateRangeFilter),
    [authorFilter, dateRangeFilter, eventTypeFilter, events, repoFilter]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" role="status" aria-label="Loading activity">
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
            Link repositories to {activeProject.name} from the Projects page to view activity.
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
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Activity Feed</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border">
              {filteredEvents.length} Events
            </span>
          </div>
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-surface-hover text-sm font-mono text-text-main hover:bg-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <ActivityFeedFilters
          eventTypeFilter={eventTypeFilter}
          repoFilter={repoFilter}
          authorFilter={authorFilter}
          dateRangeFilter={dateRangeFilter}
          repos={repos}
          authors={authors}
          onEventTypeChange={setEventTypeFilter}
          onRepoChange={setRepoFilter}
          onAuthorChange={setAuthorFilter}
          onDateRangeChange={setDateRangeFilter}
        />
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-3">
        <ActivityFeedEventList events={filteredEvents} />
      </div>
    </div>
  );
}