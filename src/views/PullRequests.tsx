import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  ExternalLink,
  GitBranch,
  GitMerge,
  GitPullRequest,
  ListChecks,
  MessageSquare,
  Search,
  ShieldAlert,
  ThumbsUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { PullRequest, PullRequestReviewSummary } from "../types";
import { cn } from "../lib/utils";
import { SortFilterPopover, SortOption, sortItems } from "../components/SortFilterPopover";
import { useProjects } from "../contexts/ProjectContext";
import { filterPullRequestsByProject, hasLinkedRepositories } from "../lib/projectSelectors";
import { getReviewDecisionLabel } from "../lib/pullRequestReviews";

type ReviewDecision = PullRequestReviewSummary["reviewDecision"];

function reviewDecisionClasses(decision: ReviewDecision | undefined) {
  switch (decision) {
    case "approved":
      return "bg-accent/10 text-accent border-accent/20";
    case "changes_requested":
      return "bg-red-500/10 text-red-300 border-red-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    default:
      return "bg-surface-hover text-text-dim border-border";
  }
}

function reviewStateIcon(decision: ReviewDecision | undefined) {
  switch (decision) {
    case "approved":
      return <ThumbsUp className="w-3.5 h-3.5" />;
    case "changes_requested":
      return <ShieldAlert className="w-3.5 h-3.5" />;
    case "pending":
      return <ListChecks className="w-3.5 h-3.5" />;
    default:
      return <MessageSquare className="w-3.5 h-3.5" />;
  }
}

export function PullRequests() {
  const { activeProject } = useProjects();
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedPullRequestId, setSelectedPullRequestId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrs = async () => {
      try {
        const res = await fetch("/api/github/pulls");
        if (res.ok) {
          const data = await res.json();
          setPrs(data);
        }
      } catch (error) {
        console.error("Failed to fetch PRs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrs();
  }, []);

  const scopedPrs = filterPullRequestsByProject(prs, activeProject);

  const filteredPrs = sortItems(
    scopedPrs.filter((pr) =>
      pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.number.toString().includes(search),
    ),
    sortBy,
  );

  useEffect(() => {
    if (filteredPrs.length === 0) {
      setSelectedPullRequestId(null);
      return;
    }

    if (!filteredPrs.some((pr) => pr.id === selectedPullRequestId)) {
      setSelectedPullRequestId(filteredPrs[0].id);
    }
  }, [filteredPrs, selectedPullRequestId]);

  const selectedPullRequest = useMemo(
    () => filteredPrs.find((pr) => pr.id === selectedPullRequestId) || null,
    [filteredPrs, selectedPullRequestId],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeProject && !hasLinkedRepositories(activeProject)) {
    return (
      <div className="p-8">
        <div className="border border-dashed border-border p-8 text-center bg-surface">
          <h3 className="text-lg font-medium text-text-main">No linked repositories</h3>
          <p className="text-sm text-text-dim mt-2">
            Link repositories to {activeProject.name} from the Projects page to view scoped pull requests.
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
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Pull Requests</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border ml-2">
              {scopedPrs.filter((pr) => pr.state === "open").length} Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SortFilterPopover value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-border bg-surface p-3 rounded-sm">
            <p className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Open</p>
            <p className="mt-2 text-lg font-semibold text-text-main">{scopedPrs.filter((pr) => pr.state === "open").length}</p>
          </div>
          <div className="border border-border bg-surface p-3 rounded-sm">
            <p className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Approved</p>
            <p className="mt-2 text-lg font-semibold text-text-main">{scopedPrs.filter((pr) => pr.reviewSummary?.reviewDecision === "approved").length}</p>
          </div>
          <div className="border border-border bg-surface p-3 rounded-sm">
            <p className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Needs review</p>
            <p className="mt-2 text-lg font-semibold text-text-main">{scopedPrs.filter((pr) => pr.reviewSummary?.reviewDecision === "pending").length}</p>
          </div>
          <div className="border border-border bg-surface p-3 rounded-sm">
            <p className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Changes requested</p>
            <p className="mt-2 text-lg font-semibold text-text-main">{scopedPrs.filter((pr) => pr.reviewSummary?.reviewDecision === "changes_requested").length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              className="w-full bg-surface-hover border border-border rounded-sm py-1.5 pl-9 pr-4 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Filter pull requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] gap-6 items-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrs.map((pr) => (
              <motion.div
                key={pr.id}
                whileHover={{ y: -2 }}
                className={cn(
                  "bg-surface border p-5 group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden",
                  selectedPullRequestId === pr.id ? "border-primary/50 shadow-[0_0_0_1px_rgba(124,92,255,0.18)]" : "border-border",
                )}
                onClick={() => setSelectedPullRequestId(pr.id)}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.75",
                    pr.merged_at ? "bg-accent" : pr.state === "open" ? "bg-primary" : "bg-text-dim",
                  )}
                />

                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-text-dim">
                    <GitBranch className="w-3 h-3" />
                    <span>#{pr.number}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-sm font-mono text-[10px] border flex items-center gap-1",
                        pr.merged_at
                          ? "bg-accent/10 text-accent border-accent/20"
                          : pr.state === "open"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-surface-well text-text-dim border-border",
                      )}
                    >
                      {pr.merged_at ? <GitMerge className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
                      {pr.merged_at ? "Merged" : pr.state}
                    </div>
                    {pr.reviewSummary && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-sm border text-[10px] font-mono uppercase tracking-wider flex items-center gap-1",
                          reviewDecisionClasses(pr.reviewSummary.reviewDecision),
                        )}
                      >
                        {reviewStateIcon(pr.reviewSummary.reviewDecision)}
                        {getReviewDecisionLabel(pr.reviewSummary.reviewDecision)}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-[15px] font-semibold text-text-main mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {pr.title}
                </h3>

                <p className="text-xs text-text-dim line-clamp-3 mb-4">
                  {pr.body || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {pr.draft && (
                    <span className="px-2 py-0.5 rounded-sm font-mono text-[10px] border bg-surface-hover text-text-dim border-border uppercase tracking-wider">
                      Draft
                    </span>
                  )}
                  {pr.reviewSummary?.requestedReviewers?.length ? (
                    <span className="px-2 py-0.5 rounded-sm font-mono text-[10px] border bg-surface-hover text-text-dim border-border flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pr.reviewSummary.requestedReviewers.length} requested
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <img
                      src={pr.user.avatar_url}
                      alt={pr.user.login}
                      className="w-5 h-5 rounded-full border border-border"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs text-text-dim">{pr.user.login}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-text-dim font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPrs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-text-dim col-span-full">
                <GitPullRequest className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-mono text-sm">No pull requests found matching your query</p>
              </div>
            )}
          </div>

          <aside className="border border-border bg-surface p-5 space-y-5 sticky top-0">
            {selectedPullRequest ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Selected PR</p>
                    <h2 className="mt-2 text-lg font-semibold text-text-main leading-tight">{selectedPullRequest.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-dim font-mono">
                      <span>#{selectedPullRequest.number}</span>
                      {selectedPullRequest.base_ref && <span>base: {selectedPullRequest.base_ref}</span>}
                      {selectedPullRequest.head_ref && <span>head: {selectedPullRequest.head_ref}</span>}
                    </div>
                  </div>
                  <a
                    href={selectedPullRequest.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80"
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-sm font-mono text-[10px] border flex items-center gap-1",
                      selectedPullRequest.merged_at
                        ? "bg-accent/10 text-accent border-accent/20"
                        : selectedPullRequest.state === "open"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-surface-well text-text-dim border-border",
                    )}
                  >
                    {selectedPullRequest.merged_at ? <GitMerge className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
                    {selectedPullRequest.merged_at ? "Merged" : selectedPullRequest.state}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-sm font-mono text-[10px] border flex items-center gap-1",
                      reviewDecisionClasses(selectedPullRequest.reviewSummary?.reviewDecision),
                    )}
                  >
                    {reviewStateIcon(selectedPullRequest.reviewSummary?.reviewDecision)}
                    {getReviewDecisionLabel(selectedPullRequest.reviewSummary?.reviewDecision || "none")}
                  </span>
                  {selectedPullRequest.draft && (
                    <span className="px-2 py-0.5 rounded-sm font-mono text-[10px] border bg-surface-hover text-text-dim border-border uppercase tracking-wider">
                      Draft
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border bg-background/40 p-3 rounded-sm">
                    <p className="text-[10px] uppercase tracking-wider text-text-dim font-mono">Approved</p>
                    <p className="mt-1 text-base font-semibold text-text-main">{selectedPullRequest.reviewSummary?.approvedCount || 0}</p>
                  </div>
                  <div className="border border-border bg-background/40 p-3 rounded-sm">
                    <p className="text-[10px] uppercase tracking-wider text-text-dim font-mono">Changes requested</p>
                    <p className="mt-1 text-base font-semibold text-text-main">{selectedPullRequest.reviewSummary?.changesRequestedCount || 0}</p>
                  </div>
                  <div className="border border-border bg-background/40 p-3 rounded-sm">
                    <p className="text-[10px] uppercase tracking-wider text-text-dim font-mono">Comments</p>
                    <p className="mt-1 text-base font-semibold text-text-main">{selectedPullRequest.reviewSummary?.commentedCount || 0}</p>
                  </div>
                  <div className="border border-border bg-background/40 p-3 rounded-sm">
                    <p className="text-[10px] uppercase tracking-wider text-text-dim font-mono">Requested</p>
                    <p className="mt-1 text-base font-semibold text-text-main">{selectedPullRequest.reviewSummary?.requestedReviewers?.length || 0}</p>
                  </div>
                </div>

                {selectedPullRequest.reviewSummary?.requestedReviewers?.length ? (
                  <div className="space-y-2">
                    <h3 className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Requested reviewers</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPullRequest.reviewSummary.requestedReviewers.map((reviewer) => (
                        <span key={reviewer.id} className="inline-flex items-center gap-2 border border-border bg-background/40 px-2 py-1 rounded-sm text-xs text-text-main">
                          <img src={reviewer.avatar_url} alt={reviewer.login} className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                          {reviewer.login}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Description</h3>
                  <div className="border border-border bg-background/40 rounded-sm p-4 text-sm text-text-main max-h-56 overflow-auto">
                    {selectedPullRequest.body ? (
                      <ReactMarkdown>{selectedPullRequest.body}</ReactMarkdown>
                    ) : (
                      <p className="text-text-dim italic">No description provided.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[11px] uppercase tracking-wider text-text-dim font-mono">Recent reviews</h3>
                  {selectedPullRequest.reviews && selectedPullRequest.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPullRequest.reviews.map((review) => (
                        <div key={review.id} className="border border-border bg-background/40 rounded-sm p-3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <img src={review.user.avatar_url} alt={review.user.login} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                              <span className="text-sm text-text-main">{review.user.login}</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-text-dim">{review.state.replaceAll("_", " ")}</span>
                          </div>
                          {review.body ? (
                            <p className="text-sm text-text-dim whitespace-pre-wrap">{review.body}</p>
                          ) : (
                            <p className="text-sm text-text-dim italic">No review comment.</p>
                          )}
                          <p className="text-[11px] text-text-dim font-mono">{formatDistanceToNow(new Date(review.submitted_at), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-border p-4 text-sm text-text-dim">
                      No review activity yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="border border-dashed border-border p-8 text-center text-text-dim">
                <GitPullRequest className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-mono">Select a pull request to inspect its review activity.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}