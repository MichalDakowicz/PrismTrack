import { useEffect, useState } from "react";
import { FolderGit2, Search, Link2, Unlink, ExternalLink, Check, Star, GitFork, Lock, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Repository, Project } from "../types";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";

export function Repositories() {
  const { repositories, activeProject, updateProject } = useProjects();
  const [search, setSearch] = useState("");
  const [linkedRepos, setLinkedRepos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [connectingRepo, setConnectingRepo] = useState<string | null>(null);

  useEffect(() => {
    if (activeProject?.linkedRepositories) {
      setLinkedRepos(new Set(activeProject.linkedRepositories.map(r => r.full_name)));
    } else {
      setLinkedRepos(new Set());
    }
  }, [activeProject]);

  const filteredRepos = repositories.filter(repo =>
    repo.full_name.toLowerCase().includes(search.toLowerCase()) ||
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleLink = async (repo: Repository) => {
    if (!activeProject) return;
    
    setConnectingRepo(repo.full_name);
    try {
      const isLinked = linkedRepos.has(repo.full_name);
      const newLinkedRepos = isLinked
        ? activeProject.linkedRepositories.filter(r => r.full_name !== repo.full_name)
        : [...activeProject.linkedRepositories, {
            id: repo.id,
            full_name: repo.full_name,
            name: repo.name,
            html_url: repo.html_url
          }];
      
      await updateProject(activeProject.id, {
        linkedRepositories: newLinkedRepos
      });
    } catch (error) {
      console.error("Failed to update repository link:", error);
    } finally {
      setConnectingRepo(null);
    }
  };

  const linkedCount = repositories.filter(r => linkedRepos.has(r.full_name)).length;

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text-main tracking-tight">Repositories</h1>
            <span className="text-xs font-mono text-text-dim bg-surface-hover px-2 py-0.5 rounded-sm border border-border ml-2">
              {linkedCount} Linked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input 
              className="w-full bg-surface-hover border border-border rounded-sm py-1.5 pl-9 pr-4 text-sm font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeProject && (
            <div className="text-sm font-mono text-text-dim">
              Linked to: <span className="text-primary">{activeProject.name}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {!activeProject ? (
          <div className="border border-dashed border-border p-8 text-center bg-surface max-w-md mx-auto mt-10">
            <FolderGit2 className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-main">No project selected</h3>
            <p className="text-sm text-text-dim mt-2">
              Select a project from the sidebar to link repositories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => {
              const isLinked = linkedRepos.has(repo.full_name);
              const isConnecting = connectingRepo === repo.full_name;

              return (
                <motion.div 
                  key={repo.id}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "bg-surface border p-5 group transition-all relative",
                    isLinked ? "border-primary/50" : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {repo.private ? (
                        <Lock className="w-4 h-4 text-text-dim" />
                      ) : (
                        <FolderGit2 className="w-4 h-4 text-text-dim" />
                      )}
                      <span className="font-mono text-xs text-text-dim">{repo.owner.login}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {repo.stargazers_count !== undefined && repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-text-dim font-mono">
                          <Star className="w-3 h-3" />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count !== undefined && repo.forks_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-text-dim font-mono ml-2">
                          <GitFork className="w-3 h-3" />
                          {repo.forks_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[15px] font-semibold text-text-main mb-2 line-clamp-1">
                    {repo.name}
                  </h3>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <button
                      onClick={() => handleToggleLink(repo)}
                      disabled={isConnecting}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono transition-all",
                        isLinked 
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-surface-hover text-text-dim hover:text-primary hover:bg-surface-hover/80",
                        isConnecting && "opacity-50 cursor-wait"
                      )}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isLinked ? (
                        <>
                          <Check className="w-3 h-3" />
                          Linked
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3" />
                          Link
                        </>
                      )}
                    </button>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-text-dim hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredRepos.length === 0 && repositories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <FolderGit2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono text-sm">No repositories found</p>
            <p className="text-xs text-text-dim mt-2">Install the GitHub app to access your repositories</p>
          </div>
        )}

        {filteredRepos.length === 0 && repositories.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-dim">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono text-sm">No repositories matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}