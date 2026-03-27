import { useEffect, useState } from "react";
import { GitPullRequest, Search, Filter, ExternalLink, Clock, GitMerge, GitBranch } from "lucide-react";
import { motion } from "motion/react";
import { PullRequest } from "../types";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useProjects } from "../contexts/ProjectContext";
import { filterPullRequestsByProject, hasLinkedRepositories } from "../lib/projectSelectors";

export function PullRequests() {
  const { activeProject } = useProjects();
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredPrs = scopedPrs.filter(pr => 
    pr.title.toLowerCase().includes(search.toLowerCase()) ||
    pr.number.toString().includes(search)
  );

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
              {scopedPrs.filter(p => p.state === "open").length} Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors">
              <Filter className="w-4 h-4" />
              Sort
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrs.map((pr) => (
            <motion.div 
              key={pr.id}
              whileHover={{ y: -2 }}
              className="bg-surface border border-border p-5 group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => window.open(pr.html_url, "_blank")}
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-0.75",
                pr.merged_at ? "bg-accent" : pr.state === "open" ? "bg-primary" : "bg-text-dim"
              )} />
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-[11px] text-text-dim">
                  <GitBranch className="w-3 h-3" />
                  <span>#{pr.number}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-sm font-mono text-[10px] border flex items-center gap-1",
                  pr.merged_at ? "bg-accent/10 text-accent border-accent/20" :
                  pr.state === "open" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-surface-well text-text-dim border-border"
                )}>
                  {pr.merged_at ? <GitMerge className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
                  {pr.merged_at ? "Merged" : pr.state}
                </div>
              </div>

              <h3 className="text-[15px] font-semibold text-text-main mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                {pr.title}
              </h3>

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
        </div>

        {filteredPrs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <GitPullRequest className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono text-sm">No pull requests found matching your query</p>
          </div>
        )}
      </div>
    </div>
  );
}
