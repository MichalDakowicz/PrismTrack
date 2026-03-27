import { FormEvent, useMemo, useState } from "react";
import { FolderKanban, Link2, Plus, Settings2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../contexts/ProjectContext";

export function Projects() {
  const navigate = useNavigate();
  const { projects, repositories, activeProjectId, createProject, updateProject, deleteProject, selectProject, loading } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const onCreateProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    const project = await createProject({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    setName("");
    setDescription("");
    selectProject(project.id);
    navigate(`/projects/${project.id}/board`);
  };

  const toggleRepository = async (repoId: number) => {
    if (!activeProject) {
      return;
    }

    const selected = new Set(activeProject.linkedRepositories.map((repo) => repo.id));
    if (selected.has(repoId)) {
      selected.delete(repoId);
    } else {
      selected.add(repoId);
    }

    await updateProject(activeProject.id, {
      repositoryIds: Array.from(selected),
    });
  };

  const toggleArchivedStatus = async (projectId: string, status: "planned" | "active" | "archived") => {
    await updateProject(projectId, {
      status: status === "archived" ? "active" : "archived",
    });
  };

  const removeProject = async (projectId: string) => {
    const confirmed = window.confirm("Remove this project? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    await deleteProject(projectId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-300 mx-auto space-y-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-text-main">Projects</h1>
          <p className="text-sm text-text-dim mt-1">Manage project scopes and linked repositories.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={onCreateProject} className="lg:col-span-1 border border-border bg-surface p-4 space-y-3">
          <h2 className="text-sm uppercase font-mono tracking-wider text-text-dim">Create Project</h2>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm"
            placeholder="Project name"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm min-h-24"
            placeholder="Project description"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-on-primary text-sm font-mono rounded-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </form>

        <div className="lg:col-span-2 border border-border bg-surface overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm uppercase font-mono tracking-wider text-text-dim">Project Directory</h2>
            <span className="text-xs font-mono text-text-dim">{projects.length} total</span>
          </div>
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-hover text-left transition-colors ${
                  project.id === activeProjectId ? "bg-surface-hover" : ""
                }`}
              >
                <button
                  onClick={() => {
                    selectProject(project.id);
                    navigate(`/projects/${project.id}/board`);
                  }}
                  className="flex-1 min-w-0"
                  aria-label={`Open ${project.name}`}
                >
                  <p className="text-sm text-text-main font-medium truncate">{project.name}</p>
                  <p className="text-xs text-text-dim mt-1 truncate">{project.description || "No description"}</p>
                </button>
                <div className="flex items-center gap-2 text-xs text-text-dim font-mono shrink-0">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5" />
                    {project.linkedRepositories.length} repos
                  </span>
                  <button
                    onClick={() => navigate(`/projects/${project.id}/settings`)}
                    className="p-1.5 border border-border rounded-sm hover:bg-surface-well"
                    title="Project settings"
                    aria-label={`Open settings for ${project.name}`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleArchivedStatus(project.id, project.status)}
                    className="px-2 py-1 border border-border rounded-sm hover:bg-surface-well"
                    title={project.status === "archived" ? "Restore project" : "Archive project"}
                  >
                    {project.status === "archived" ? "Restore" : "Archive"}
                  </button>
                  <button
                    onClick={() => void removeProject(project.id)}
                    className="p-1.5 border border-red-500/40 text-red-300 rounded-sm hover:bg-red-500/10"
                    title="Delete project"
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-text-dim">No projects yet. Create one to get started.</div>
            )}
          </div>
        </div>
      </section>

      <section className="border border-border bg-surface p-4">
        <h2 className="text-sm uppercase font-mono tracking-wider text-text-dim mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Linked Repositories
        </h2>

        {!activeProject ? (
          <p className="text-sm text-text-dim">Select a project to manage repository links.</p>
        ) : (
          <div className="space-y-2">
            {repositories.map((repo) => {
              const checked = activeProject.linkedRepositories.some((linkedRepo) => linkedRepo.id === repo.id);
              return (
                <label key={repo.id} className="flex items-center justify-between gap-4 p-2 hover:bg-surface-hover rounded-sm cursor-pointer">
                  <div>
                    <p className="text-sm text-text-main">{repo.full_name}</p>
                    <p className="text-xs text-text-dim">{repo.private ? "Private" : "Public"} repository</p>
                  </div>
                  <input
                    checked={checked}
                    onChange={() => toggleRepository(repo.id)}
                    type="checkbox"
                    className="h-4 w-4"
                  />
                </label>
              );
            })}
            {repositories.length === 0 && (
              <p className="text-sm text-text-dim">No repositories available for linking.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
