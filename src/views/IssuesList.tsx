import { useEffect, useState } from "react";
import { Search, Plus, Filter, ExternalLink, CircleDot, CheckCircle2, XCircle, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { Issue } from "../types";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { CreateIssueModal } from "../components/CreateIssueModal";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, hasLinkedRepositories, getRepositoryFullName } from "../lib/projectSelectors";

export function IssuesList() {
  const { activeProject } = useProjects();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updatingIssue, setUpdatingIssue] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/github/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateIssueState = async (issue: Issue, newState: "open" | "closed") => {
    const repoFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    setUpdatingIssue(issue.number);
    
    try {
      const res = await fetch(`/api/github/issues/${owner}/${repo}/${issue.number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });

      if (res.ok) {
        setIssues(prev => prev.map(i => 
          i.id === issue.id ? { ...i, state: newState } : i
        ));
        showNotification("success", `Issue #${issue.number} ${newState === "closed" ? "closed" : "reopened"}`);
      } else {
        const data = await res.json();
        showNotification("error", data.error || "Failed to update issue");
      }
    } catch (error) {
      showNotification("error", "Failed to update issue");
    } finally {
      setUpdatingIssue(null);
    }
  };

  const scopedIssues = filterIssuesByProject(issues, activeProject);

  const filteredIssues = scopedIssues.filter(issue => 
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.number.toString().includes(search)
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
            Link repositories to {activeProject.name} from the Projects page to view scoped issues.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-sm text-sm font-mono flex items-center gap-2",
            notification.type === "success" 
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          )}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </motion.div>
      )}

      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Issues</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border ml-2">
              {scopedIssues.filter(i => i.state === "open").length} Open
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors">
              <Filter className="w-4 h-4" />
              Sort
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded-sm text-sm font-mono uppercase tracking-wide transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Issue
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
              className="w-full bg-surface-hover border border-border rounded-sm py-1.5 pl-9 pr-4 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Filter issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-surface/95 backdrop-blur-sm z-10 border-b border-border text-[11px] font-mono text-text-dim uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-normal w-12">
                <input type="checkbox" className="rounded-sm bg-background border-border text-primary focus:ring-primary h-3.5 w-3.5" />
              </th>
              <th className="px-4 py-3 font-normal w-24">ID</th>
              <th className="px-4 py-3 font-normal w-full min-w-75">Title</th>
              <th className="px-4 py-3 font-normal w-32">Status</th>
              <th className="px-4 py-3 font-normal w-48">Labels</th>
              <th className="px-6 py-3 font-normal w-32 text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filteredIssues.map((issue) => (
              <tr 
                key={issue.id} 
                className="group hover:bg-surface-hover transition-colors relative"
              >
                <td className="px-6 py-2.5">
                  <input type="checkbox" className="rounded-sm bg-background border-border text-primary focus:ring-primary h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
                <td className="px-4 py-2.5 font-mono text-text-dim group-hover:text-primary transition-colors">#{issue.number}</td>
                <td className="px-4 py-2.5">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => window.open(issue.html_url, "_blank")}
                  >
                    {issue.state === "open" ? (
                      <CircleDot className="w-4 h-4 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    )}
                    <span className="font-medium text-text-main truncate max-w-100">{issue.title}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono bg-surface border border-border",
                      issue.state === "open" ? "text-primary border-primary/20" : "text-accent border-accent/20"
                    )}>
                      {issue.state}
                    </span>
                    {updatingIssue === issue.number ? (
                      <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {issue.state === "open" ? (
                          <button
                            onClick={() => updateIssueState(issue, "closed")}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                            title="Close issue"
                          >
                            <XCircle className="w-4 h-4 text-text-dim hover:text-accent" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateIssueState(issue, "open")}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                            title="Reopen issue"
                          >
                            <RotateCcw className="w-4 h-4 text-text-dim hover:text-primary" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map(label => (
                      <span 
                        key={label.id}
                        className="px-1.5 py-0.5 rounded-sm text-[10px] font-mono border"
                        style={{ 
                          backgroundColor: `#${label.color}20`, 
                          borderColor: `#${label.color}40`,
                          color: `#${label.color}`
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                    {issue.labels.length === 0 && (
                      <span className="text-xs font-mono text-text-dim italic">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-2.5 font-mono text-text-dim text-xs text-right">
                  {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 border-t border-border bg-surface px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-text-dim">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent" /> API Synced</span>
                  <span>{filteredIssues.length} issues</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><kbd className="bg-surface-hover border border-border rounded px-1">J</kbd> / <kbd className="bg-surface-hover border border-border rounded px-1">K</kbd> to navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-surface-hover border border-border rounded px-1">X</kbd> to select</span>
        </div>
      </footer>

      <CreateIssueModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchIssues}
      />
    </div>
  );
}
