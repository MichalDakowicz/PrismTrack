import { useEffect, useState } from "react";
import { MoreHorizontal, Plus, CircleDot, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { Issue } from "../types";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, hasLinkedRepositories } from "../lib/projectSelectors";

export function Board() {
  const { activeProject } = useProjects();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/github/issues");
        if (res.ok) {
          const data = await res.json();
          setIssues(data);
        }
      } catch (error) {
        console.error("Failed to fetch issues for board:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const scopedIssues = filterIssuesByProject(issues, activeProject);

  const columns = [
    { 
      id: "backlog", 
      title: "Backlog", 
      issues: scopedIssues.filter(i => i.state === "open" && i.labels.length === 0)
    },
    { 
      id: "in-progress", 
      title: "In Progress", 
      issues: scopedIssues.filter(i => i.state === "open" && i.labels.length > 0)
    },
    { 
      id: "done", 
      title: "Done", 
      issues: scopedIssues.filter(i => i.state === "closed")
    }
  ];

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
            Link repositories to {activeProject.name} from the Projects page to populate this board.
          </p>
        </div>
      </div>
    );
  }

  if (scopedIssues.length === 0) {
    return (
      <div className="p-8">
        <div className="border border-dashed border-border p-8 text-center bg-surface">
          <h3 className="text-lg font-medium text-text-main">No issues in scope</h3>
          <p className="text-sm text-text-dim mt-2">
            {activeProject
              ? `No issues from linked repositories were found for ${activeProject.name}.`
              : "No issues were found for the board view."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto p-6 brutalist-grid">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((col) => (
          <div key={col.id} className="w-80 flex flex-col bg-transparent">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="font-mono text-[12px] font-bold text-text-dim tracking-widest uppercase">
                {col.title} <span className="ml-2 text-[10px] opacity-40 font-normal">{col.issues.length}</span>
              </h2>
              <MoreHorizontal className="w-4 h-4 text-text-dim" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {col.issues.map((issue) => (
                <motion.div 
                  key={issue.id}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "bg-surface border border-border p-4 group hover:border-border-strong transition-colors cursor-grab active:cursor-grabbing",
                    col.id === "in-progress" && "border-l-2 border-l-primary"
                  )}
                  onClick={() => window.open(issue.html_url, "_blank")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-primary">#{issue.number}</span>
                    <span className="px-2 py-0.5 font-mono text-[10px] bg-surface-well text-text-muted">
                      {issue.state}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-3 leading-tight text-text-main group-hover:text-primary transition-colors">
                    {issue.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.slice(0, 2).map(label => (
                        <span 
                          key={label.id}
                          className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono border"
                          style={{ 
                            backgroundColor: `#${label.color}20`, 
                            borderColor: `#${label.color}40`,
                            color: `#${label.color}`
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                    <img 
                      src={issue.user.avatar_url} 
                      alt={issue.user.login}
                      className="w-5 h-5 rounded-full border border-border"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              ))}
              
              <button className="w-full py-3 font-mono text-[11px] text-text-dim hover:text-primary hover:bg-surface-hover transition-all flex items-center justify-center gap-2 border border-dashed border-border">
                <Plus className="w-3 h-3" />
                ADD ISSUE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
