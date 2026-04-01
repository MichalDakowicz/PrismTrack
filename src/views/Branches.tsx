import { useEffect, useState } from "react";
import { GitBranch, Search, GitPullRequest, Shield, AlertTriangle, X, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Branch } from "../types";
import { cn } from "../lib/utils";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { useProjects } from "../contexts/ProjectContext";
import { hasLinkedRepositories } from "../lib/projectSelectors";
import { BranchDetailSidebar } from "../components/BranchDetailSidebar";

const STALE_THRESHOLD_DAYS = 14;
const CACHE_KEY = "prismtrack_branches_cache";

type StatusFilter = "all" | "protected" | "unprotected" | "stale";
type PRFilter = "all" | "has-pr" | "no-pr" | "open" | "merged";

interface CachedBranches {
  branches: Branch[];
  timestamp: number;
  projectId: string;
}

export function Branches() {
  const { activeProject } = useProjects();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [prFilter, setPrFilter] = useState<PRFilter>("all");

  const getCacheKey = () => {
    if (!activeProject) return null;
    return `${CACHE_KEY}_${activeProject.id}`;
  };

  const loadFromCache = (): Branch[] | null => {
    const key = getCacheKey();
    if (!key) return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data: CachedBranches = JSON.parse(cached);
        return data.branches;
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  };

  const saveToCache = (branchesToCache: Branch[]) => {
    const key = getCacheKey();
    if (!key) return;
    
    const data: CachedBranches = {
      branches: branchesToCache,
      timestamp: Date.now(),
      projectId: activeProject?.id || "",
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  };

  const fetchBranches = async (forceRefresh = false) => {
    if (!activeProject || !hasLinkedRepositories(activeProject)) {
      setLoading(false);
      return;
    }

    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached && cached.length > 0) {
        setBranches(cached);
        setLoading(false);
        setIsRefreshing(true);
      }
    }

    try {
      const repos = activeProject.linkedRepositories.map((r) => r.full_name);
      const allBranches: Branch[] = [];

      for (const repo of repos) {
        const url = `/api/github/branches?repo=${encodeURIComponent(repo)}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          allBranches.push(...data);
        }
      }

      allBranches.sort((a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime());
      setBranches(allBranches);
      saveToCache(allBranches);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBranches(false);
  }, [activeProject]);

  useEffect(() => {
    if (!selectedBranch) return;

    const stillExists = branches.some(
      (branch) =>
        branch.name === selectedBranch.name &&
        branch.repository.full_name === selectedBranch.repository.full_name
    );

    if (!stillExists) {
      setSelectedBranch(branches.length > 0 ? branches[0] : null);
    }
  }, [branches, selectedBranch]);

  const uniqueRepos = [...new Map(branches.map((b) => [b.repository.full_name, b.repository])).values()];
  const uniqueAuthors = [...new Set(branches.map((b) => b.author.login))].sort();

  const filteredBranches = branches.filter((b) => {
    if (selectedRepo !== "all" && b.repository.full_name !== selectedRepo) return false;
    
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;

    const commitDate = new Date(b.lastCommitDate);
    const daysSinceCommit = differenceInDays(new Date(), commitDate);
    const isStale = daysSinceCommit >= STALE_THRESHOLD_DAYS;

    switch (statusFilter) {
      case "protected":
        if (!b.protected) return false;
        break;
      case "unprotected":
        if (b.protected) return false;
        break;
      case "stale":
        if (!isStale) return false;
        break;
    }

    switch (prFilter) {
      case "has-pr":
        if (!b.pullRequest) return false;
        break;
      case "no-pr":
        if (b.pullRequest) return false;
        break;
      case "open":
        if (!b.pullRequest || b.pullRequest.state !== "open") return false;
        break;
      case "merged":
        if (!b.pullRequest || b.pullRequest.state !== "merged") return false;
        break;
    }

    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPrFilter("all");
    setSelectedRepo("all");
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const hasActiveFilters = search || statusFilter !== "all" || prFilter !== "all" || selectedRepo !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
            Link repositories to {activeProject.name} from the Projects page to view branches.
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
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Branches</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border ml-2">
              {filteredBranches.length} Branches
            </span>
            {isRefreshing && (
              <span className="flex items-center gap-1 text-xs font-mono text-text-dim">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBranches(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors"
              disabled={isRefreshing}
            >
              <Loader2 className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-text-dim hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors cursor-pointer"
            >
              <option value="all">All Repos</option>
              {uniqueRepos.map((repo) => (
                <option key={repo.full_name} value={repo.full_name}>
                  {repo.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="protected">Protected</option>
              <option value="unprotected">Unprotected</option>
              <option value="stale">Stale</option>
            </select>
            <select
              value={prFilter}
              onChange={(e) => setPrFilter(e.target.value as PRFilter)}
              className="px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors cursor-pointer"
            >
              <option value="all">All PRs</option>
              <option value="has-pr">Has PR</option>
              <option value="no-pr">No PR</option>
              <option value="open">Open PR</option>
              <option value="merged">Merged PR</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
              className="w-full bg-surface-hover border border-border rounded-sm py-1.5 pl-9 pr-4 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="h-full flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm z-10 border-b border-border text-[11px] font-mono text-text-dim uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-normal w-12">
                <input type="checkbox" className="rounded-sm bg-background border-border text-primary focus:ring-primary h-3.5 w-3.5" />
              </th>
              <th className="px-4 py-3 font-normal w-64">Branch</th>
              <th className="px-4 py-3 font-normal w-48">Last Commit</th>
              <th className="px-4 py-3 font-normal w-32">Author</th>
              <th className="px-4 py-3 font-normal w-32">Status</th>
              <th className="px-4 py-3 font-normal w-24">PR</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-border text-sm">
            {filteredBranches.map((branch) => {
              const commitDate = new Date(branch.lastCommitDate);
              const daysSinceCommit = differenceInDays(new Date(), commitDate);
              const isStale = daysSinceCommit >= STALE_THRESHOLD_DAYS;
              const isSelected =
                selectedBranch?.name === branch.name &&
                selectedBranch?.repository.full_name === branch.repository.full_name;

              return (
                <tr
                  key={`${branch.repository.full_name}:${branch.name}`}
                  className={cn(
                    "group hover:bg-surface-hover cursor-pointer transition-colors",
                    isSelected && "bg-primary/10",
                    isStale && "bg-accent/5"
                  )}
                  onClick={() => handleSelectBranch(branch)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectBranch(branch);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-6 py-3">
                    <input type="checkbox" className="rounded-sm bg-background border-border text-primary focus:ring-primary h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className={cn("w-4 h-4", isStale ? "text-accent" : "text-text-dim")} />
                      <span className="font-mono text-text-dim text-xs">{branch.repository.name}/</span>
                      <span className="font-medium text-text-main truncate max-w-48">{branch.name}</span>
                      {branch.protected && (
                        <span aria-label="Protected branch">
                          <Shield className="w-3.5 h-3.5 text-primary ml-1" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-text-dim">
                        {formatDistanceToNow(commitDate, { addSuffix: true })}
                      </span>
                      {isStale && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-mono text-accent">stale</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {branch.author.avatar_url ? (
                        <img
                          src={branch.author.avatar_url}
                          alt={branch.author.login}
                          className="w-5 h-5 rounded-full border border-border"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border bg-surface-hover flex items-center justify-center text-[10px] text-text-dim">
                          {branch.author.login.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-text-dim">@{branch.author.login}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono border",
                      branch.protected
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-surface-well text-text-muted border-border"
                    )}>
                      {branch.protected ? <Shield className="w-3 h-3" /> : null}
                      {branch.protected ? "Protected" : "Unprotected"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {branch.pullRequest ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        href={branch.pullRequest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-mono border",
                          branch.pullRequest.state === "open"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-accent/10 text-accent border-accent/20"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GitPullRequest className="w-3 h-3" />
                        #{branch.pullRequest.number}
                      </motion.a>
                    ) : (
                      <span className="text-xs font-mono text-text-dim">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>

          {filteredBranches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-dim">
              <GitBranch className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-mono text-sm">No branches found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {selectedBranch ? (
          <BranchDetailSidebar branch={selectedBranch} />
        ) : (
          <div className="hidden md:flex h-full w-[24rem] shrink-0 border-l border-border bg-surface p-4">
            <div className="m-auto flex max-w-xs flex-col items-center text-center text-text-dim">
              <GitBranch className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm font-mono">Select a branch to view details</p>
            </div>
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-border bg-surface px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-text-dim">
        <div className="flex items-center gap-4">
          {isRefreshing ? (
            <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading from GitHub...</span>
          ) : (
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Cached</span>
          )}
          <span>{filteredBranches.length} branches</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><kbd className="bg-surface-hover border border-border rounded px-1">J</kbd> / <kbd className="bg-surface-hover border border-border rounded px-1">K</kbd> to navigate</span>
        </div>
      </footer>
    </div>
  );
}
