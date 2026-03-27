import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, FolderGit2, AlertCircle } from "lucide-react";
import { Repository } from "../types";
import { cn } from "../lib/utils";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateIssueModal({ isOpen, onClose, onSuccess }: CreateIssueModalProps) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/github/repos")
        .then(res => res.json())
        .then(data => {
          setRepos(data.slice(0, 20));
          if (data.length > 0) setSelectedRepo(data[0].full_name);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo || !title) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: selectedRepo, title, body }),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
        setTitle("");
        setBody("");
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[110]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] bg-surface border border-border shadow-2xl z-[111] rounded-sm overflow-hidden"
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
                  className="w-full bg-surface-well border border-border rounded-sm py-2 px-3 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] transition-all resize-none"
                  placeholder="Describe the issue..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
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
    </AnimatePresence>
  );
}
