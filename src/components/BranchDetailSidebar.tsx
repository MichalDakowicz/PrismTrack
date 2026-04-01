import {
    ExternalLink,
    GitBranch,
    GitPullRequest,
    Shield,
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import { Branch, BranchCommitHistoryItem } from "../types";
import { cn } from "../lib/utils";

const STALE_THRESHOLD_DAYS = 14;

interface BranchDetailSidebarProps {
    branch: Branch;
}

function getAuthorInitial(login?: string) {
    if (!login) return "?";
    return login.charAt(0).toUpperCase();
}

export function BranchDetailSidebar({
    branch,
}: BranchDetailSidebarProps) {
    const [commits, setCommits] = useState<BranchCommitHistoryItem[]>([]);
    const [isLoadingCommits, setIsLoadingCommits] = useState(false);
    const [commitsError, setCommitsError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadCommitHistory = async () => {
            setIsLoadingCommits(true);
            setCommitsError(null);

            try {
                const params = new URLSearchParams({
                    repo: branch.repository.full_name,
                    branch: branch.name,
                });

                const response = await fetch(
                    `/api/github/branch-commits?${params.toString()}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch commit history");
                }

                const data = await response.json();
                setCommits(Array.isArray(data) ? data : []);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setCommitsError("Unable to load commit history right now.");
                    setCommits([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingCommits(false);
                }
            }
        };

        loadCommitHistory();

        return () => controller.abort();
    }, [branch.name, branch.repository.full_name]);

    const commitDate = new Date(branch.lastCommitDate);
    const hasValidCommitDate = Number.isFinite(commitDate.getTime());
    const daysSinceCommit = hasValidCommitDate
        ? differenceInDays(new Date(), commitDate)
        : null;
    const isStale =
        daysSinceCommit !== null && daysSinceCommit >= STALE_THRESHOLD_DAYS;

    const branchName = branch.name || "Unknown branch";
    const repositoryName = branch.repository?.name || "Unknown repository";
    const repositoryFullName =
        branch.repository?.full_name || "Unknown repository";
    const authorLogin = branch.author?.login || "unknown";
    const authorAvatarUrl = branch.author?.avatar_url || "";
    const pullRequestState = branch.pullRequest?.state || "none";

    return (
        <aside
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-border bg-surface shadow-2xl md:static md:inset-auto md:z-0 md:h-full md:w-[24rem] md:max-w-none md:shadow-none"
            aria-label="Branch details"
        >
                <div className="space-y-5 p-4 text-sm">
                    <section className="space-y-2">
                        <div className="flex items-start gap-2">
                            <GitBranch className="mt-0.5 h-4 w-4 text-text-dim" />
                            <div className="min-w-0">
                                <p className="break-all font-mono text-xs text-text-dim">
                                    {repositoryName}/
                                </p>
                                <p className="break-all font-medium text-text-main">
                                    {branchName}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-mono",
                                    branch.protected
                                        ? "border-primary/20 bg-primary/10 text-primary"
                                        : "border-border bg-surface-well text-text-muted",
                                )}
                            >
                                {branch.protected ? (
                                    <Shield className="h-3 w-3" />
                                ) : null}
                                {branch.protected ? "Protected" : "Unprotected"}
                            </span>
                            {isStale && (
                                <span className="inline-flex rounded-sm border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent">
                                    Stale
                                </span>
                            )}
                            {pullRequestState !== "none" && (
                                <span className="inline-flex rounded-sm border border-border bg-surface-well px-2 py-0.5 text-xs font-mono text-text-muted">
                                    PR: {pullRequestState}
                                </span>
                            )}
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-mono uppercase tracking-wide text-text-dim">
                            Repository
                        </h3>
                        <p className="break-all font-mono text-xs text-text-main">
                            {repositoryFullName}
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-mono uppercase tracking-wide text-text-dim">
                            Last updated
                        </h3>
                        {hasValidCommitDate ? (
                            <p className="font-mono text-xs text-text-main">
                                {formatDistanceToNow(commitDate, {
                                    addSuffix: true,
                                })}
                            </p>
                        ) : (
                            <p className="font-mono text-xs text-text-dim">
                                Unknown
                            </p>
                        )}
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-mono uppercase tracking-wide text-text-dim">
                            Author
                        </h3>
                        <div className="flex items-center gap-2">
                            {authorAvatarUrl ? (
                                <img
                                    src={authorAvatarUrl}
                                    alt={authorLogin}
                                    className="h-6 w-6 rounded-full border border-border"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-hover text-[10px] text-text-dim">
                                    {getAuthorInitial(authorLogin)}
                                </div>
                            )}
                            <span className="text-xs text-text-main">
                                @{authorLogin}
                            </span>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-mono uppercase tracking-wide text-text-dim">
                            Actions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://github.com/${repositoryFullName}/tree/${branchName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface-hover px-2 py-1 text-xs font-mono text-text-main hover:bg-border"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open branch
                            </a>
                            {branch.pullRequest ? (
                                <a
                                    href={branch.pullRequest.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-mono text-primary"
                                >
                                    <GitPullRequest className="h-3 w-3" />
                                    PR #{branch.pullRequest.number}
                                </a>
                            ) : null}
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-xs font-mono uppercase tracking-wide text-text-dim">
                            Commit history
                        </h3>
                        {isLoadingCommits ? (
                            <p className="font-mono text-xs text-text-dim">
                                Loading commits...
                            </p>
                        ) : null}
                        {commitsError ? (
                            <p className="font-mono text-xs text-accent">
                                {commitsError}
                            </p>
                        ) : null}
                        {!isLoadingCommits &&
                        !commitsError &&
                        commits.length === 0 ? (
                            <p className="font-mono text-xs text-text-dim">
                                No recent commits available.
                            </p>
                        ) : null}
                        {!isLoadingCommits &&
                        !commitsError &&
                        commits.length > 0 ? (
                            <ul className="space-y-2">
                                {commits.map((item) => {
                                    const itemDate = new Date(item.committedAt);
                                    const committedLabel = Number.isFinite(
                                        itemDate.getTime(),
                                    )
                                        ? formatDistanceToNow(itemDate, {
                                              addSuffix: true,
                                          })
                                        : "unknown time";

                                    return (
                                        <li
                                            key={item.sha}
                                            className="rounded-sm border border-border bg-surface-well px-2 py-1.5"
                                        >
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-xs text-text-main hover:text-primary"
                                            >
                                                {item.message}
                                            </a>
                                            <div className="mt-1 flex items-center justify-between gap-2">
                                                <span className="font-mono text-[10px] text-text-dim">
                                                    {item.sha.slice(0, 7)}
                                                </span>
                                                <span className="font-mono text-[10px] text-text-dim">
                                                    @{item.authorLogin} ·{" "}
                                                    {committedLabel}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}
                    </section>
                </div>
            </aside>
    );
}
