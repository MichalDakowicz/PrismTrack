import { formatDistanceToNow } from "date-fns";
import { Activity, ExternalLink, GitBranch, GitMerge, GitPullRequest, MessageSquare } from "lucide-react";
import { ACTIVITY_EVENT_LABELS, ActivityEvent } from "../../lib/activityFeed";

function renderActivityIcon(type: ActivityEvent["type"]) {
  switch (type) {
    case "issue_opened":
    case "issue_closed":
    case "issue_updated":
      return <MessageSquare className="w-4 h-4" />;
    case "pr_opened":
    case "pr_closed":
      return <GitPullRequest className="w-4 h-4" />;
    case "pr_merged":
      return <GitMerge className="w-4 h-4" />;
    default:
      return <GitBranch className="w-4 h-4" />;
  }
}

interface ActivityFeedEventListProps {
  events: ActivityEvent[];
}

export function ActivityFeedEventList({ events }: ActivityFeedEventListProps) {
  if (events.length === 0) {
    return (
      <div className="border border-dashed border-border bg-surface p-10 text-center">
        <Activity className="w-8 h-8 text-text-dim mx-auto mb-3" />
        <h3 className="text-lg font-medium text-text-main">No activity in this filter</h3>
        <p className="text-sm text-text-dim mt-2">Try widening your date range or clearing filters.</p>
      </div>
    );
  }

  return (
    <>
      {events.map((event) => (
        <article key={event.id} className="border border-border bg-surface p-4 rounded-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 text-primary">{renderActivityIcon(event.type)}</div>
            <div className="min-w-0">
              <p className="text-sm text-text-main truncate">
                <span className="font-medium">{event.actor}</span> {ACTIVITY_EVENT_LABELS[event.type].toLowerCase()} {event.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-dim font-mono">
                <span>{event.repo}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80"
          >
            Open
            <ExternalLink className="w-3 h-3" />
          </a>
        </article>
      ))}
    </>
  );
}
