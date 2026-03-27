import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleDot, GitPullRequest, AlertCircle, ExternalLink } from "lucide-react";
import { Issue, PullRequest } from "../types";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";
import {
  filterIssuesByProject,
  filterPullRequestsByProject,
  hasLinkedRepositories,
} from "../lib/projectSelectors";

export function Dashboard() {
  const { activeProject } = useProjects();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, prsRes] = await Promise.all([
          fetch("/api/github/issues"),
          fetch("/api/github/pulls"),
        ]);
        
        if (issuesRes.ok && prsRes.ok) {
          const issuesData = await issuesRes.json();
          const prsData = await prsRes.json();
          setIssues(issuesData.slice(0, 10)); // Limit to 10
          setPrs(prsData.slice(0, 10)); // Limit to 10
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scopedIssues = filterIssuesByProject(issues, activeProject);
  const scopedPrs = filterPullRequestsByProject(prs, activeProject);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeProject && !hasLinkedRepositories(activeProject)) {
    return (
      <div className="p-8 max-w-300 mx-auto">
        <div className="border border-dashed border-border p-8 text-center bg-surface">
          <h3 className="text-lg font-medium text-text-main">No linked repositories</h3>
          <p className="text-sm text-text-dim mt-2">
            Link repositories to {activeProject.name} from the Projects page to see scoped dashboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-300 mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* My Issues */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-mono text-[12px] uppercase text-text-dim tracking-wide">My Issues</h2>
            <button className="text-text-dim hover:text-text-main transition-colors">
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {scopedIssues.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border text-text-dim font-mono text-sm">
                No active issues found
              </div>
            ) : (
              scopedIssues.map((issue) => (
                <motion.div 
                  key={issue.id}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-4 p-3 bg-surface hover:bg-surface-hover border border-transparent hover:border-border cursor-pointer transition-all"
                  onClick={() => window.open(issue.html_url, "_blank")}
                >
                  <div className="flex items-center gap-3 min-w-25">
                    <CircleDot className={cn(
                      "w-4 h-4",
                      issue.state === "open" ? "text-primary" : "text-text-dim"
                    )} />
                    <span className="font-mono text-[13px] text-text-dim group-hover:text-text-main">#{issue.number}</span>
                  </div>
                  <p className="text-[14px] text-text-main truncate flex-1">{issue.title}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-text-dim" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Active PRs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-mono text-[12px] uppercase text-text-dim tracking-wide">Active PRs</h2>
          </div>

          <div className="space-y-2">
            {scopedPrs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border text-text-dim font-mono text-sm">
                No active pull requests found
              </div>
            ) : (
              scopedPrs.map((pr) => (
                <motion.div 
                  key={pr.id}
                  whileHover={{ scale: 1.01 }}
                  className="group flex flex-col gap-2 p-4 bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => window.open(pr.html_url, "_blank")}
                >
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.5",
                    pr.state === "open" ? "bg-primary" : "bg-accent"
                  )} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-medium text-text-main">{pr.title}</h3>
                      <span className="font-mono text-[12px] text-text-dim">#{pr.number}</span>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-sm font-mono text-[11px] border flex items-center gap-1 shrink-0",
                      pr.state === "open" ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-accent/10 text-accent border-accent/20"
                    )}>
                      <GitPullRequest className="w-3 h-3" />
                      {pr.state}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
