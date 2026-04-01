import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, FolderGit2, AlertCircle, Tag, Loader2, User } from "lucide-react";
import { Repository, Label, User as UserType } from "../types";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateIssueModal({ isOpen, onClose, onSuccess }: CreateIssueModalProps) {
  const { activeProject } = useProjects();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<UserType[]>([]);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/github/repos")
        .then(res => res.json())
        .then(data => {
          let filteredRepos = data.slice(0, 20);
          
          if (activeProject && activeProject.linkedRepositories.length > 0) {
            const linkedNames = activeProject.linkedRepositories.map(r => r.full_name);
            filteredRepos = filteredRepos.filter((r: Repository) => linkedNames.includes(r.full_name));
          }
          
          setRepos(filteredRepos);
          if (filteredRepos.length > 0) {
            setSelectedRepo(filteredRepos[0].full_name);
          }
        });
    }
  }, [isOpen, activeProject]);

  useEffect(() => {
    if (selectedRepo) {
      setLabelsLoading(true);
      setAvailableLabels([]);
      setSelectedLabels([]);
      setAssigneesLoading(true);
      setAvailableAssignees([]);
      setSelectedAssignees([]);
      
      const [owner, repo] = selectedRepo.split("/");
      Promise.all([
        fetch(`/api/github/repos/${owner}/${repo}/labels`),
        fetch(`/api/github/repos/${owner}/${repo}/assignees`)
      ])
        .then(([labelsRes, assigneesRes]) => Promise.all([labelsRes.json(), assigneesRes.json()]))
        .then(([labelsData, assigneesData]) => {
          if (Array.isArray(labelsData)) {
            setAvailableLabels(labelsData);
          }
          if (Array.isArray(assigneesData)) {
            setAvailableAssignees(assigneesData);
          }
        })
        .catch(() => {
          setAvailableLabels([]);
          setAvailableAssignees([]);
        })
        .finally(() => {
          setLabelsLoading(false);
          setAssigneesLoading(false);
        });
    }
  }, [selectedRepo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo || !title) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          repo: selectedRepo, 
          title, 
          body,
          labels: selectedLabels.length > 0 ? selectedLabels : undefined,
          assignees: selectedAssignees.length > 0 ? selectedAssignees : undefined 
        }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
        setTitle("");
        setBody("");
        setSelectedLabels([]);
        setSelectedAssignees([]);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create issue");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (labelName: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelName) 
        ? prev.filter(l => l !== labelName)
        : [...prev, labelName]
    );
  };

  const toggleAssignee = (username: string) => {
    setSelectedAssignees(prev => 
      prev.includes(username) 
        ? prev.filter(a => a !== username)
        : [...prev, username]
    );
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-9600"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-130 bg-surface border border-border shadow-2xl z-9601 rounded-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                New Issue
              </h2>
              <button onClick={onClose} className="text-text-dim hover:text-text-main transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3 text-red-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase text-text-dim tracking-wider">Repository</label>
                <div className="relative">
                  <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <select 
                    className="w-full bg-surface-well border border-border rounded-sm py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all"
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    required
                  >
                    {repos.map(repo => (
                      <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase text-text-dim tracking-wider">Title</label>
                <input 
                  className="w-full bg-surface-well border border-border rounded-sm py-2 px-3 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Issue title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase text-text-dim tracking-wider">Description (Optional)</label>
                <textarea 
                  className="w-full bg-surface-well border border-border rounded-sm py-2 px-3 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-30 transition-all resize-none"
                  placeholder="Describe the issue..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase text-text-dim tracking-wider flex items-center gap-2">
                  Labels
                  {labelsLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </label>
                {availableLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableLabels.map(label => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.name)}
                      className={cn(
                        "px-2 py-1 rounded-sm text-xs font-mono border transition-all",
                        selectedLabels.includes(label.name)
                          ? "ring-1 ring-offset-1 ring-offset-surface ring-primary"
                          : "opacity-70 hover:opacity-100"
                      )}
                      style={{ 
                        backgroundColor: `#${label.color}20`, 
                        borderColor: selectedLabels.includes(label.name) ? `#${label.color}` : `#${label.color}40`,
                        color: `#${label.color}`
                      }}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-text-dim italic py-2">
                    {labelsLoading ? "Loading labels..." : "No labels defined"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase text-text-dim tracking-wider flex items-center gap-2">
                  Assignees
                  {assigneesLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </label>
                {availableAssignees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableAssignees.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleAssignee(user.login)}
                        className={cn(
                          "px-2 py-1 rounded-sm text-xs font-mono border transition-all flex items-center gap-1.5",
                          selectedAssignees.includes(user.login)
                            ? "ring-1 ring-offset-1 ring-offset-surface ring-primary"
                            : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        {user.login}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-text-dim italic py-2">
                    {assigneesLoading ? "Loading assignees..." : "No assignees available"}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-mono text-text-dim hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !title || !selectedRepo}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary rounded-sm text-sm font-mono uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Issue
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
