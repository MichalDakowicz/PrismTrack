import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ChevronDown, Globe, Plus, Settings2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";

export function ProjectSwitcher() {
  const navigate = useNavigate();
  const { projects, activeProject, selectProject, createProject } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = activeProject ? activeProject.name : "Global";
  const currentIcon = activeProject ? FolderKanban : Globe;
  const CurrentIcon = currentIcon;

  const openGlobalScope = () => {
    selectProject(null);
    setIsOpen(false);
    navigate("/");
  };

  const openProjectScope = (projectId: string) => {
    selectProject(projectId);
    setIsOpen(false);
    navigate(`/projects/${projectId}/board`);
  };

  const openProjectSettings = () => {
    if (!activeProject) {
      return;
    }
    setIsOpen(false);
    navigate(`/projects/${activeProject.id}/settings`);
  };

  const createNewProject = async () => {
    const name = window.prompt("Project name");
    if (!name || !name.trim()) {
      return;
    }

    try {
      const project = await createProject({
        name: name.trim(),
      });
      selectProject(project.id);
      setIsOpen(false);
      navigate(`/projects/${project.id}/board`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="h-14 flex items-center px-4 border-b border-border shrink-0 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full hover:bg-surface-hover p-1 rounded-sm transition-colors group"
      >
        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-[10px] font-bold text-on-primary shrink-0">
          <CurrentIcon className="w-3 h-3 text-on-primary" />
        </div>
        <span className="font-mono text-[13px] text-text-main font-medium truncate">
          {currentLabel}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-text-dim ml-auto group-hover:text-text-main transition-transform shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-2 right-2 mt-1 bg-surface-well border border-border rounded-sm shadow-lg z-50">
          <div className="p-1 space-y-0.5 max-h-64 overflow-y-auto">
            <button
              onClick={() => void createNewProject()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors text-[13px] w-full text-left text-text-dim hover:text-text-main hover:bg-surface-hover"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Create Project</span>
            </button>

            <button
              onClick={openProjectSettings}
              disabled={!activeProject}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors text-[13px] w-full text-left",
                activeProject
                  ? "text-text-dim hover:text-text-main hover:bg-surface-hover"
                  : "text-text-dim/50 cursor-not-allowed"
              )}
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Project Settings</span>
            </button>

            <div className="border-t border-border my-1" />

            <button
              onClick={openGlobalScope}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors text-[13px] w-full text-left",
                !activeProject
                  ? "bg-surface-hover text-primary"
                  : "text-text-dim hover:text-text-main hover:bg-surface-hover"
              )}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="truncate">Global</span>
            </button>

            {projects.slice(0, 8).map((project) => (
              <button
                key={project.id}
                onClick={() => openProjectScope(project.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors text-[13px] w-full text-left",
                  activeProject?.id === project.id
                    ? "bg-surface-hover text-primary"
                    : "text-text-dim hover:text-text-main hover:bg-surface-hover"
                )}
              >
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span className="truncate">{project.name}</span>
              </button>
            ))}

            {projects.length === 0 && (
              <div className="px-3 py-1.5 text-[13px] text-text-dim">No projects yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
