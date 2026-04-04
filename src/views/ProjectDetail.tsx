import { BarChart3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useProjects } from "../contexts/ProjectContext";
import { Project } from "../types";
import { Board } from "./Board";
import { IssuesList } from "./IssuesList";
import { Timeline } from "./Timeline";
import { ActivityFeed } from "./ActivityFeed";
import { Pulse } from "./Pulse";

const validViews = [
    "board",
    "list",
    "timeline",
    "activity",
    "pulse",
    "settings",
] as const;

function ProjectSettingsPanel({ project }: { project: Project }) {
    const { repositories, updateProject } = useProjects();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [status, setStatus] = useState<Project["status"]>(project.status);
    const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>(
        project.linkedRepositories.map((repo) => repo.id),
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setName(project.name);
        setDescription(project.description || "");
        setStatus(project.status);
        setSelectedRepoIds(project.linkedRepositories.map((repo) => repo.id));
        setSaved(false);
    }, [project]);

    const toggleRepo = (repoId: number) => {
        setSelectedRepoIds((current) => {
            if (current.includes(repoId)) {
                return current.filter((id) => id !== repoId);
            }
            return [...current, repoId];
        });
        setSaved(false);
    };

    const onSave = async () => {
        setSaving(true);
        try {
            await updateProject(project.id, {
                name: name.trim() || project.name,
                description: description.trim() || undefined,
                status,
                repositoryIds: selectedRepoIds,
            });
            setSaved(true);
        } catch (error) {
            console.error("Failed to update project settings:", error);
            setSaved(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-245 mx-auto space-y-6">
            <div className="border border-border bg-surface p-5 space-y-4">
                <h3 className="text-sm uppercase font-mono tracking-wide text-text-dim">
                    General
                </h3>
                <div className="space-y-2">
                    <label className="text-xs font-mono text-text-dim">
                        Project name
                    </label>
                    <input
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            setSaved(false);
                        }}
                        className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-text-dim">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                            setSaved(false);
                        }}
                        className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm min-h-24"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-text-dim">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value as Project["status"]);
                            setSaved(false);
                        }}
                        className="w-full bg-surface-hover border border-border rounded-sm py-2 px-3 text-sm"
                    >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            <div className="border border-border bg-surface p-5 space-y-4">
                <h3 className="text-sm uppercase font-mono tracking-wide text-text-dim">
                    Repository Links
                </h3>
                <p className="text-sm text-text-dim">
                    Reconfigure repositories whenever scope changes. These links
                    drive project issue and PR filtering.
                </p>
                <div className="space-y-2">
                    {repositories.map((repo) => (
                        <label
                            key={repo.id}
                            className="flex items-center justify-between gap-4 p-2 rounded-sm hover:bg-surface-hover cursor-pointer"
                        >
                            <div>
                                <p className="text-sm text-text-main">
                                    {repo.full_name}
                                </p>
                                <p className="text-xs text-text-dim">
                                    {repo.private ? "Private" : "Public"}{" "}
                                    repository
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={selectedRepoIds.includes(repo.id)}
                                onChange={() => toggleRepo(repo.id)}
                                className="h-4 w-4"
                            />
                        </label>
                    ))}
                    {repositories.length === 0 && (
                        <p className="text-sm text-text-dim">
                            No repositories available for linking.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-on-primary text-sm font-mono rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save settings"}
                </button>
                {saved && (
                    <span className="text-sm text-accent font-mono">Saved</span>
                )}
            </div>
        </div>
    );
}

function EmptyScopedView({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="p-8">
            <div className="border border-dashed border-border p-8 text-center bg-surface">
                <BarChart3 className="w-10 h-10 text-text-dim mx-auto mb-3" />
                <h3 className="text-lg font-medium text-text-main">{title}</h3>
                <p className="text-sm text-text-dim mt-2">{description}</p>
            </div>
        </div>
    );
}

export function ProjectDetail() {
    const navigate = useNavigate();
    const { projectId, view = "board" } = useParams();
    const { projects, loading, selectProject } = useProjects();

    const project = useMemo(
        () => projects.find((item) => item.id === projectId) || null,
        [projects, projectId],
    );

    useEffect(() => {
        if (projectId) {
            selectProject(projectId);
        }
    }, [projectId, selectProject]);

    useEffect(() => {
        const exists = validViews.includes(
            (view || "board") as (typeof validViews)[number],
        );
        if (!exists && projectId) {
            navigate(`/projects/${projectId}/board`, { replace: true });
        }
    }, [view, projectId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <EmptyScopedView
                title="Project not found"
                description="Select a project from the Projects page to continue."
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                {view === "board" && <Board />}
                {view === "list" && <IssuesList />}
                {view === "timeline" && (
                    <Timeline />
                )}
                {view === "activity" && (
                    <ActivityFeed />
                )}
                {view === "pulse" && (
                    <Pulse />
                )}
                {view === "settings" && (
                    <ProjectSettingsPanel project={project} />
                )}
            </div>
        </div>
    );
}
