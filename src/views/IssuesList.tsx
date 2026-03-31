import { useEffect, useState } from "react";
import { Search, Plus, Filter, ExternalLink, CircleDot, CheckCircle2, XCircle, RotateCcw, Loader2, AlertCircle, User, X, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Issue, User as UserType } from "../types";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { CreateIssueModal } from "../components/CreateIssueModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { SortFilterPopover, SortOption, sortItems } from "../components/SortFilterPopover";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, hasLinkedRepositories, getRepositoryFullName } from "../lib/projectSelectors";
import { useSidebar } from "../contexts/SidebarContext";
import { useFilterPresets, FILTER_PRESETS } from "../hooks/useFilterPresets";
import { useAuth } from "../contexts/AuthContext";
import { usePopups } from "../hooks/usePopups";

export function IssuesList() {
  const { activeProject } = useProjects();
  const { openPanel } = useSidebar();
  const { activeFilter } = useFilterPresets();
  const { user } = useAuth();
  const popups = usePopups();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updatingIssue, setUpdatingIssue] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [availableAssignees, setAvailableAssignees] = useState<UserType[]>([]);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [managingAssigneesFor, setManagingAssigneesFor] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDeleteIssue = (issue: Issue): boolean => {
    if (!user || !issue.repository) return false;
    return user.login === issue.repository.owner.login;
  };

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
    
    // Set up polling to refresh issues every 5 seconds for live updates
    const pollInterval = setInterval(() => {
      fetchIssues();
    }, 5000);

    return () => clearInterval(pollInterval);
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

  const openAssigneeManager = async (issue: Issue) => {
    const repoFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    setAssigneesLoading(true);
    setManagingAssigneesFor(issue.number);

    try {
      const res = await fetch(`/api/github/repos/${owner}/${repo}/assignees`);
      if (res.ok) {
        const data = await res.json();
        setAvailableAssignees(data);
      }
    } catch (error) {
      console.error("Failed to fetch assignees:", error);
    } finally {
      setAssigneesLoading(false);
    }
  };

  const addAssignee = async (issue: Issue, username: string) => {
    const repoFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    setUpdatingIssue(issue.number);

    try {
      const res = await fetch(`/api/github/repos/${owner}/${repo}/issues/${issue.number}/assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees: [username] }),
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => 
          i.id === issue.id ? { ...i, assignees: updatedIssue.assignees } : i
        ));
        showNotification("success", `Assigned ${username} to issue #${issue.number}`);
      } else {
        const data = await res.json();
        showNotification("error", data.error || "Failed to add assignee");
      }
    } catch (error) {
      showNotification("error", "Failed to add assignee");
    } finally {
      setUpdatingIssue(null);
    }
  };

  const removeAssignee = async (issue: Issue, username: string) => {
    const repoFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    setUpdatingIssue(issue.number);

    try {
      const res = await fetch(`/api/github/repos/${owner}/${repo}/issues/${issue.number}/assignees`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees: [username] }),
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(i => 
          i.id === issue.id ? { ...i, assignees: updatedIssue.assignees } : i
        ));
        showNotification("success", `Removed ${username} from issue #${issue.number}`);
      } else {
        const data = await res.json();
        showNotification("error", data.error || "Failed to remove assignee");
      }
    } catch (error) {
      showNotification("error", "Failed to remove assignee");
    } finally {
      setUpdatingIssue(null);
    }
  };

  const deleteIssue = async (issue: Issue) => {
    const repoFullName = issue.repository?.full_name || getRepositoryFullName(issue.repository_url);
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/github/issues/${owner}/${repo}/${issue.number}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIssues(prev => prev.filter(i => i.id !== issue.id));
        popups.success("Deleted", `Issue #${issue.number} deleted successfully`);
        setDeleteConfirmOpen(false);
        setIssueToDelete(null);
      } else {
        const data = await res.json();
        popups.error("Delete Failed", data.error || "Failed to delete issue");
      }
    } catch (error) {
      popups.error("Error", "Failed to delete issue");
    } finally {
      setIsDeleting(false);
    }
  };

  const scopedIssues = filterIssuesByProject(issues, activeProject);

  const activePreset = FILTER_PRESETS.find(p => p.id === activeFilter);

  const filteredIssues = sortItems(
    scopedIssues.filter(issue => {
      const matchesSearch = 
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.number.toString().includes(search);
      
      if (!activePreset) return matchesSearch;
      
      const matchesFilter = issue.labels.some(label => activePreset.filter(label.name));
      return matchesSearch && matchesFilter;
    }),
    sortBy
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
            <SortFilterPopover value={sortBy} onChange={setSortBy} />
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
              <th className="px-4 py-3 font-normal w-40">Assignees</th>
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
                    onClick={() => openPanel(issue)}
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
                        {canDeleteIssue(issue) && (
                          <button
                            onClick={() => {
                              setIssueToDelete(issue);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                            title="Delete issue"
                          >
                            <Trash2 className="w-4 h-4 text-text-dim hover:text-red-400" />
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
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1 items-center">
                    {(issue.assignees || []).length > 0 ? (
                      issue.assignees.map(user => (
                        <div key={user.id} className="relative group/assignee">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.login}
                              className="w-5 h-5 rounded-full border border-border"
                              title={user.login}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                              <User className="w-3 h-3 text-text-dim" />
                            </div>
                          )}
                          <button
                            onClick={() => removeAssignee(issue, user.login)}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white opacity-0 group-hover/assignee:opacity-100 transition-opacity flex items-center justify-center"
                            title={`Remove ${user.login}`}
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span 
                        className="text-xs font-mono text-text-dim italic cursor-pointer hover:text-primary"
                        onClick={() => openAssigneeManager(issue)}
                        title="Add assignee"
                      >
                        None
                      </span>
                    )}
                    <button
                      onClick={() => openAssigneeManager(issue)}
                      className="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-primary hover:text-primary transition-all"
                      title="Add assignee"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
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

      {managingAssigneesFor !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9700] flex items-center justify-center">
          <div className="bg-surface border border-border rounded-sm shadow-2xl w-full max-w-[300px] max-h-[400px] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-text-main">
                Assignees
              </h3>
              <button 
                onClick={() => setManagingAssigneesFor(null)}
                className="text-text-dim hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[320px]">
              {assigneesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-text-dim" />
                </div>
              ) : availableAssignees.length > 0 ? (
                <div className="space-y-1">
                  {availableAssignees.map(user => {
                    const isAssigned = issues.find(i => i.number === managingAssigneesFor)?.assignees?.some(a => a.login === user.login);
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          const issue = issues.find(i => i.number === managingAssigneesFor);
                          if (issue) {
                            if (isAssigned) {
                              removeAssignee(issue, user.login);
                            } else {
                              addAssignee(issue, user.login);
                            }
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-all",
                          isAssigned 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-surface-hover text-text-main"
                        )}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-text-dim" />
                        )}
                        <span className="flex-1 text-left font-mono text-xs">{user.login}</span>
                        {isAssigned && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-text-dim font-mono text-xs">
                  No assignees available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Issue"
        message={`Are you sure you want to delete issue #${issueToDelete?.number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={() => issueToDelete && deleteIssue(issueToDelete)}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setIssueToDelete(null);
        }}
      />

    </div>
  );
}
