import { motion, AnimatePresence } from "motion/react";
import { Search, CircleDot, GitPullRequest, LayoutDashboard, Kanban, ExternalLink, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Issue, PullRequest } from "../types";
import { useProjects } from "../contexts/ProjectContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { activeProject, selectProject } = useProjects();
  const [search, setSearch] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const fetchSearchResults = async () => {
      if (search.length < 2) {
        setIssues([]);
        setPrs([]);
        return;
      }

      setLoading(true);
      try {
        const [issuesRes, prsRes] = await Promise.all([
          fetch(`/api/github/issues?q=${encodeURIComponent(search)}`),
          fetch(`/api/github/pulls?q=${encodeURIComponent(search)}`),
        ]);

        if (issuesRes.ok && prsRes.ok) {
          const issuesData = await issuesRes.json();
          const prsData = await prsRes.json();
          setIssues(issuesData.slice(0, 5));
          setPrs(prsData.slice(0, 5));
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const commands = [
    { icon: LayoutDashboard, label: "Go to Dashboard", shortcut: ["G", "D"], action: () => navigate("/") },
    {
      icon: FolderKanban,
      label: "Use Global Scope",
      shortcut: ["G", "S"],
      action: () => {
        selectProject(null);
        navigate("/");
      },
    },
    { icon: FolderKanban, label: "Go to Projects", shortcut: ["G", "J"], action: () => navigate("/projects") },
    { icon: CircleDot, label: "Go to Issues", shortcut: ["G", "I"], action: () => navigate("/issues") },
    { icon: Kanban, label: "Go to Board", shortcut: ["G", "B"], action: () => navigate("/board") },
    { icon: GitPullRequest, label: "Go to Pull Requests", shortcut: ["G", "P"], action: () => navigate("/pull-requests") },
    ...(activeProject
      ? [{
          icon: FolderKanban,
          label: `Open ${activeProject.name} Board`,
          shortcut: ["P", "B"],
          action: () => {
            selectProject(activeProject.id);
            navigate(`/projects/${activeProject.id}/board`);
          },
        }, {
          icon: FolderKanban,
          label: `Open ${activeProject.name} Settings`,
          shortcut: ["P", "S"],
          action: () => {
            selectProject(activeProject.id);
            navigate(`/projects/${activeProject.id}/settings`);
          },
        }]
      : []),
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-100"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-160 bg-surface border border-border shadow-2xl z-101 overflow-hidden rounded-sm"
          >
            <div className="p-3 border-b border-border">
              <div className="flex items-center h-12 bg-background rounded-sm px-3 focus-within:ring-1 focus-within:ring-primary transition-all">
                <Search className="w-5 h-5 text-text-dim mr-3" />
                <input 
                  autoFocus
                  placeholder="Type a command or search issues/PRs..."
                  className="flex-1 bg-transparent border-none text-text-main text-base focus:outline-none focus:ring-0 placeholder:text-text-dim"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onClose();
                    if (e.key === "Enter" && filteredCommands[0]) {
                      filteredCommands[0].action();
                      onClose();
                    }
                  }}
                />
                <kbd className="font-mono text-[10px] text-text-dim bg-surface border border-border rounded px-1.5 py-0.5">Esc</kbd>
              </div>
            </div>

            <div className="max-h-100 overflow-y-auto py-2 custom-scrollbar">
              {filteredCommands.length > 0 && (
                <div className="px-3 mb-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-dim px-3 py-1">Navigation</h3>
                  <div className="space-y-px">
                    {filteredCommands.map((cmd) => (
                      <button
                        key={cmd.label}
                        onClick={() => { cmd.action(); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover group transition-colors text-left"
                      >
                        <cmd.icon className="w-4.5 h-4.5 text-text-dim group-hover:text-primary transition-colors" />
                        <span className="flex-1 text-sm text-text-main group-hover:text-primary transition-colors">{cmd.label}</span>
                        <div className="flex items-center gap-1">
                          {cmd.shortcut.map(s => (
                            <kbd key={s} className="font-mono text-[10px] text-text-dim bg-background border border-border rounded px-1.5 py-0.5">{s}</kbd>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {issues.length > 0 && (
                <div className="px-3 mb-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-dim px-3 py-1">Issues</h3>
                  <div className="space-y-px">
                    {issues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => { window.open(issue.html_url, "_blank"); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover group transition-colors text-left"
                      >
                        <CircleDot className="w-4.5 h-4.5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-main group-hover:text-primary transition-colors truncate">{issue.title}</p>
                          <p className="text-[11px] text-text-dim font-mono">#{issue.number}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {prs.length > 0 && (
                <div className="px-3 mb-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-dim px-3 py-1">Pull Requests</h3>
                  <div className="space-y-px">
                    {prs.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => { window.open(pr.html_url, "_blank"); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover group transition-colors text-left"
                      >
                        <GitPullRequest className="w-4.5 h-4.5 text-accent" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-main group-hover:text-primary transition-colors truncate">{pr.title}</p>
                          <p className="text-[11px] text-text-dim font-mono">#{pr.number}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                </div>
              )}

              {search.length >= 2 && !loading && issues.length === 0 && prs.length === 0 && filteredCommands.length === 0 && (
                <div className="px-6 py-8 text-center text-text-dim font-mono text-sm">
                  No results found for "{search}"
                </div>
              )}
            </div>

            <div className="border-t border-border bg-background px-4 py-2 flex items-center justify-between text-[10px] font-mono text-text-dim">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-surface border border-border rounded px-1">↑</kbd>
                  <kbd className="bg-surface border border-border rounded px-1">↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-surface border border-border rounded px-1">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div>PrismTrack Command Palette</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
