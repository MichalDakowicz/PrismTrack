import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, GitPullRequest, RotateCcw, CircleDot, GitMerge, AlertCircle } from "lucide-react";
import { useProjects } from "../contexts/ProjectContext";
import { useSidebar } from "../contexts/SidebarContext";
import { Issue, PullRequest } from "../types";
import { filterIssuesByProject, hasLinkedRepositories } from "../lib/projectSelectors";
import {
  applyTimelineFilters,
  defaultRangeEnd,
  defaultRangeStart,
  normalizeTimelineItems,
  TimelineGranularity,
  TimelineItem,
  TimelineStateFilter,
} from "../lib/timelineSelectors";

type LoadState = "loading" | "ready" | "error";
const DAY_MS = 24 * 60 * 60 * 1000;
type TimelineZoom = "day" | "week" | "month";

const ZOOM_CONFIG: Record<TimelineZoom, {
  visibleUnits: number;
  initialHistoryUnits: number;
  initialFutureUnits: number;
  extendUnits: number;
}> = {
  day: { visibleUnits: 1, initialHistoryUnits: 120, initialFutureUnits: 40, extendUnits: 45 },
  week: { visibleUnits: 7, initialHistoryUnits: 120, initialFutureUnits: 40, extendUnits: 45 },
  month: { visibleUnits: 31, initialHistoryUnits: 240, initialFutureUnits: 80, extendUnits: 60 },
};

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

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return startOfDay(copy);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roadmapBarStyle(item: TimelineItem, rangeStart: Date, rangeEnd: Date) {
  const chartStart = rangeStart.getTime();
  const chartEnd = rangeEnd.getTime();
  const total = Math.max(chartEnd - chartStart, 1);

  const itemStart = clamp(new Date(item.startAt).getTime(), chartStart, chartEnd);
  const itemEnd = clamp(new Date(item.endAt).getTime(), chartStart, chartEnd);

  const left = ((itemStart - chartStart) / total) * 100;
  const width = Math.max(((Math.max(itemEnd, itemStart) - itemStart) / total) * 100, 1.2);

  return { left: `${left}%`, width: `${width}%` };
}

function roadmapDeadlineStyle(deadlineAt: string, rangeStart: Date, rangeEnd: Date) {
  const chartStart = rangeStart.getTime();
  const chartEnd = rangeEnd.getTime();
  const total = Math.max(chartEnd - chartStart, 1);
  const deadline = new Date(deadlineAt).getTime();

  if (deadline < chartStart || deadline > chartEnd) {
    return null;
  }

  const left = ((deadline - chartStart) / total) * 100;
  return { left: `${left}%` };
}

function buildColumns(windowStart: Date, windowEnd: Date, colWidth: number, zoom: TimelineZoom) {
  const columns: Array<{
    key: string;
    start: Date;
    end: Date;
    label: string;
    unitLabel: string;
    isToday: boolean;
  }> = [];

  const today = new Date();
  let cursor = startOfDay(windowStart);
  const limit = endOfDay(windowEnd).getTime();

  while (cursor.getTime() <= limit) {
    const start = startOfDay(cursor);
    const end = endOfDay(cursor);
    const isToday = today.getTime() >= start.getTime() && today.getTime() <= end.getTime();

    const label =
      zoom === "month"
        ? start.toLocaleDateString(undefined, { day: "2-digit" })
        : start.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const unitLabel =
      zoom === "month"
        ? start.toLocaleDateString(undefined, { month: "short" }).toUpperCase()
        : start.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();

    columns.push({
      key: start.toISOString(),
      start,
      end,
      label,
      unitLabel,
      isToday,
    });

    cursor = addDays(cursor, 1);
  }

  return {
    columns,
    widthPx: columns.length * colWidth,
    todayIndex: Math.max(columns.findIndex((col) => col.isToday), 0),
  };
}

export function Timeline() {
  const { activeProject } = useProjects();
  const { openPanel } = useSidebar();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [granularity, setGranularity] = useState<TimelineGranularity>("week");
  const [stateFilter, setStateFilter] = useState<TimelineStateFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [repositoryFilter, setRepositoryFilter] = useState("");
  const [rangeStart, setRangeStart] = useState<Date>(() => defaultRangeStart(30));
  const [rangeEnd, setRangeEnd] = useState<Date>(() => defaultRangeEnd());
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const [didInitialPosition, setDidInitialPosition] = useState(false);
  const [timelineViewportWidth, setTimelineViewportWidth] = useState(1200);

  const fetchTimelineData = async () => {
    setLoadState("loading");
    try {
      const [issuesRes, prsRes] = await Promise.all([
        fetch("/api/github/issues"),
        fetch("/api/github/pulls"),
      ]);

      if (!issuesRes.ok || !prsRes.ok) {
        throw new Error("Failed to load timeline data");
      }

      const [issuesData, prsData] = await Promise.all([
        issuesRes.json(),
        prsRes.json(),
      ]);

      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setPrs(Array.isArray(prsData) ? prsData : []);
      setLoadState("ready");
    } catch (error) {
      console.error("Failed to fetch timeline data:", error);
      setLoadState("error");
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const normalizedItems = useMemo(
    () => normalizeTimelineItems(issues, prs, activeProject),
    [issues, prs, activeProject],
  );

  const filteredItems = useMemo(
    () =>
      applyTimelineFilters(
        normalizedItems,
        {
          state: stateFilter,
          assignee: assigneeFilter,
          repository: repositoryFilter,
        },
        rangeStart,
        rangeEnd,
      ),
    [normalizedItems, stateFilter, assigneeFilter, repositoryFilter, rangeStart, rangeEnd],
  );

  const zoom = granularity as TimelineZoom;
  const zoomConfig = ZOOM_CONFIG[zoom];
  const colWidth = Math.max(timelineViewportWidth / zoomConfig.visibleUnits, 20);

  useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) {
      return;
    }

    const updateWidth = () => setTimelineViewportWidth(el.clientWidth || 1200);
    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadState]);

  useEffect(() => {
    const today = new Date();
    const nextStart = addDays(startOfDay(today), -zoomConfig.initialHistoryUnits);
    const nextEnd = endOfDay(addDays(today, zoomConfig.initialFutureUnits));
    setRangeStart(nextStart);
    setRangeEnd(nextEnd);
    setDidInitialPosition(false);
  }, [zoom, zoomConfig.initialFutureUnits, zoomConfig.initialHistoryUnits]);

  const maxRows = granularity === "day" ? 120 : granularity === "week" ? 200 : 300;
  const visibleItems = filteredItems.slice(0, maxRows);
  const hiddenCount = Math.max(filteredItems.length - visibleItems.length, 0);
  const timelineWindow = useMemo(
    () => buildColumns(rangeStart, rangeEnd, colWidth, zoom),
    [rangeStart, rangeEnd, colWidth, zoom],
  );
  const scopedIssues = useMemo(() => filterIssuesByProject(issues, activeProject), [issues, activeProject]);
  const issueLookup = useMemo(() => {
    const map = new Map<string, Issue>();
    for (const issue of scopedIssues) {
      const key = `${issue.repository?.full_name || ""}#${issue.number}`;
      map.set(key, issue);
    }
    return map;
  }, [scopedIssues]);

  useEffect(() => {
    if (!timelineScrollRef.current || didInitialPosition) {
      return;
    }

    const el = timelineScrollRef.current;
    const todayCenter = timelineWindow.todayIndex * colWidth + colWidth / 2;
    const target = Math.max(todayCenter - el.clientWidth * 0.75, 0);
    el.scrollLeft = target;
    setDidInitialPosition(true);
  }, [timelineWindow.todayIndex, colWidth, didInitialPosition]);

  const handleTimelineScroll = () => {
    const el = timelineScrollRef.current;
    if (!el) {
      return;
    }

    const threshold = colWidth * 4;

    if (el.scrollLeft < threshold) {
      const oldWidth = timelineWindow.widthPx;
      setRangeStart((current) => addDays(current, -zoomConfig.extendUnits));
      setTimeout(() => {
        const nextEl = timelineScrollRef.current;
        if (!nextEl) {
          return;
        }
        const widthDelta = nextEl.scrollWidth - oldWidth;
        nextEl.scrollLeft += Math.max(widthDelta, 0);
      }, 0);
      return;
    }

    if (el.scrollWidth - el.clientWidth - el.scrollLeft < threshold) {
      setRangeEnd((current) => endOfDay(addDays(current, zoomConfig.extendUnits)));
    }
  };

  if (activeProject && !hasLinkedRepositories(activeProject)) {
    return (
      <div className="p-8">
        <div className="border border-dashed border-border p-8 text-center bg-surface">
          <h3 className="text-lg font-medium text-text-main">No linked repositories</h3>
          <p className="text-sm text-text-dim mt-2">
            Link repositories to {activeProject.name} from the Projects page to view timeline activity.
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center h-full" role="status" aria-label="Loading timeline">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="p-8">
        <div className="border border-border p-8 text-center bg-surface space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <div>
            <h3 className="text-lg font-medium text-text-main">Failed to load timeline</h3>
            <p className="text-sm text-text-dim mt-2">Please retry to fetch timeline data.</p>
          </div>
          <button
            onClick={fetchTimelineData}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-on-primary rounded-sm text-sm font-mono hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      <header className="shrink-0 h-12 border-b border-border px-6 flex items-center justify-between bg-surface">
        <div className="flex items-center gap-5">
          <h1 className="text-sm font-semibold text-text-main tracking-tight">Timeline</h1>
          <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim uppercase tracking-wide">
            <span>Assignee</span>
            <input
              aria-label="Timeline assignee filter"
              className="bg-surface-hover border border-border rounded-sm px-2 py-1 text-[11px] normal-case tracking-normal text-text-main w-24"
              placeholder="All"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
            />
            <span>Repository</span>
            <input
              aria-label="Timeline repository filter"
              className="bg-surface-hover border border-border rounded-sm px-2 py-1 text-[11px] normal-case tracking-normal text-text-main w-34"
              placeholder="acme/web"
              value={repositoryFilter}
              onChange={(event) => setRepositoryFilter(event.target.value)}
            />
            <span>State</span>
            <select
              aria-label="Timeline state filter"
              className="bg-surface-hover border border-border rounded-sm px-2 py-1 text-[11px] normal-case tracking-normal text-text-main"
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value as TimelineStateFilter)}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="merged">Merged</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Timeline granularity"
            className="bg-surface-hover border border-border rounded-sm px-2 py-1 text-[11px] font-mono text-text-main"
            value={granularity}
            onChange={(event) => setGranularity(event.target.value as TimelineGranularity)}
          >
            <option value="day">DAY</option>
            <option value="week">WEEK</option>
            <option value="month">MONTH</option>
          </select>
          <button
            onClick={fetchTimelineData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border rounded-sm text-[11px] font-mono text-text-dim hover:text-text-main hover:bg-surface-hover"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden" aria-label="Timeline buckets">
        {visibleItems.length === 0 ? (
          <div className="h-full border border-dashed border-border bg-surface p-8 text-center m-6">
            <CalendarRange className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-main">No timeline items in range</h3>
            <p className="text-sm text-text-dim mt-2">
              Adjust filters or date range to inspect project activity.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="h-10 border-b border-border bg-surface-well px-6 flex items-center justify-between text-[11px] font-mono text-text-dim uppercase tracking-wide">
                <span>{filteredItems.length} roadmap items</span>
                <span>Infinite scroll enabled</span>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="w-72 border-r border-border flex flex-col flex-shrink-0 bg-surface-container-low">
                <div className="h-10 flex items-center px-4 border-b border-border bg-surface-container-lowest">
                  <span className="font-mono text-[10px] text-text-dim font-bold uppercase tracking-[0.16em]">Issue & ID</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {visibleItems.map((item) => (
                    <button
                      key={`issue-col-${item.id}`}
                      className="h-12 border-b border-border/50 w-full flex items-center px-4 gap-3 hover:bg-surface-hover transition-colors text-left"
                      onClick={() => {
                        if (item.type !== "issue") {
                          window.open(item.htmlUrl, "_blank", "noopener,noreferrer");
                          return;
                        }

                        const lookupKey = `${item.repositoryFullName}#${item.number}`;
                        const issue = issueLookup.get(lookupKey);
                        if (issue) {
                          openPanel(issue);
                        }
                      }}
                    >
                      <span className="font-mono text-[10px] text-primary/80">#{item.number}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-main truncate">{item.title}</p>
                        <p className="text-[10px] font-mono text-text-dim truncate">{item.repositoryFullName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={timelineScrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden relative bg-surface-container-lowest"
                onScroll={handleTimelineScroll}
              >
                <div className="h-10 flex border-b border-border sticky top-0 bg-surface-container-lowest z-10" style={{ width: timelineWindow.widthPx }}>
                  {timelineWindow.columns.map((day) => (
                    <div
                      key={day.key}
                      className={`flex-shrink-0 border-r border-border flex flex-col items-center justify-center ${day.isToday ? "bg-surface-hover/70" : ""}`}
                      style={{ width: colWidth }}
                    >
                      <span className={`font-mono text-[10px] uppercase ${day.isToday ? "text-primary" : "text-text-dim"}`}>{day.label}</span>
                      <span className={`font-mono text-[11px] font-bold ${day.isToday ? "text-primary" : "text-text-main"}`}>{day.unitLabel}</span>
                    </div>
                  ))}
                </div>

                <div className="relative" style={{ width: timelineWindow.widthPx }}>
                  {/* Milestone markers */}
                  {visibleItems
                    .filter((item) => !!item.deadlineAt)
                    .slice(0, 12)
                    .map((item) => {
                      const deadline = roadmapDeadlineStyle(item.deadlineAt!, rangeStart, rangeEnd);
                      if (!deadline) {
                        return null;
                      }
                      return (
                        <div
                          key={`milestone-${item.id}`}
                          className="absolute top-0 bottom-0 w-px bg-secondary/50 z-20"
                          style={deadline}
                        />
                      );
                    })}

                  {visibleItems.map((item) => {
                    const bar = roadmapBarStyle(item, rangeStart, rangeEnd);

                    return (
                      <div key={`lane-${item.id}`} className="h-12 border-b border-border/50 flex items-center relative">
                        <div className="absolute inset-y-0 left-0 right-0 pointer-events-none" style={{
                          backgroundImage: "linear-gradient(to right, rgba(72,69,85,0.6) 1px, transparent 1px)",
                          backgroundSize: `${colWidth}px 100%`,
                        }} />
                        <button
                          className={`absolute h-6 rounded-sm flex items-center px-2 border text-left transition-all ${
                            item.type === "issue"
                              ? "bg-primary/85 border-primary/50 shadow-[0_0_20px_rgba(124,92,255,0.22)]"
                              : item.state === "merged"
                              ? "bg-secondary/30 border-secondary/50"
                              : "bg-primary/50 border-primary/30"
                          }`}
                          style={bar}
                          aria-label={`Roadmap bar for ${item.title}`}
                          onClick={() => {
                            if (item.type !== "issue") {
                              window.open(item.htmlUrl, "_blank", "noopener,noreferrer");
                              return;
                            }

                            const lookupKey = `${item.repositoryFullName}#${item.number}`;
                            const issue = issueLookup.get(lookupKey);
                            if (issue) {
                              openPanel(issue);
                            }
                          }}
                        >
                          <span className="text-[10px] font-mono text-white/90 uppercase tracking-wide truncate">
                            {item.state === "merged" ? "Merged" : item.state === "closed" ? "Done" : "In Progress"}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="h-10 border-t border-border bg-surface-container-lowest px-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-text-dim">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>Core Item</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span>Milestone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-outline" />
                  <span>Dependency</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span>Zoom: 100%</span>
                {hiddenCount > 0 && <span>+{hiddenCount} hidden</span>}
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
