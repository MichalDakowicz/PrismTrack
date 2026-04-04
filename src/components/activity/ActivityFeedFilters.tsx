import { ACTIVITY_EVENT_LABELS, ActivityEventType, DateRangeFilter } from "../../lib/activityFeed";

interface ActivityFeedFiltersProps {
  eventTypeFilter: ActivityEventType | "all";
  repoFilter: string;
  authorFilter: string;
  dateRangeFilter: DateRangeFilter;
  repos: string[];
  authors: string[];
  onEventTypeChange: (value: ActivityEventType | "all") => void;
  onRepoChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
}

export function ActivityFeedFilters({
  eventTypeFilter,
  repoFilter,
  authorFilter,
  dateRangeFilter,
  repos,
  authors,
  onEventTypeChange,
  onRepoChange,
  onAuthorChange,
  onDateRangeChange,
}: ActivityFeedFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <select
        aria-label="Event type filter"
        value={eventTypeFilter}
        onChange={(event) => onEventTypeChange(event.target.value as ActivityEventType | "all")}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="all">All event types</option>
        {Object.keys(ACTIVITY_EVENT_LABELS).map((type) => (
          <option key={type} value={type}>
            {ACTIVITY_EVENT_LABELS[type as ActivityEventType]}
          </option>
        ))}
      </select>

      <select
        aria-label="Repository filter"
        value={repoFilter}
        onChange={(event) => onRepoChange(event.target.value)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="all">All repositories</option>
        {repos.map((repo) => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>

      <select
        aria-label="Author filter"
        value={authorFilter}
        onChange={(event) => onAuthorChange(event.target.value)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="all">All authors</option>
        {authors.map((author) => (
          <option key={author} value={author}>
            {author}
          </option>
        ))}
      </select>

      <select
        aria-label="Date range filter"
        value={dateRangeFilter}
        onChange={(event) => onDateRangeChange(event.target.value as DateRangeFilter)}
        className="px-3 py-1.5 bg-surface-hover border border-border rounded-sm text-sm"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="365d">Last year</option>
        <option value="all">All time</option>
      </select>
    </div>
  );
}
