import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal, Plus, CircleDot, CheckCircle2, AlertCircle, User } from "lucide-react";
import { motion } from "motion/react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "../types";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";
import { filterIssuesByProject, hasLinkedRepositories } from "../lib/projectSelectors";
import { useSidebar } from "../contexts/SidebarContext";
import { CreateIssueModal } from "../components/CreateIssueModal";

const STATUS_LABELS = {
  backlog: "status:backlog",
  "in-progress": "status:in-progress",
  done: "status:done",
};

interface Column {
  id: string;
  title: string;
  issues: Issue[];
}

interface SortableIssueProps {
  issue: Issue;
  isDragging?: boolean;
  onOpenPanel?: (issue: Issue) => void;
}

function SortableIssue({ issue, isDragging, onOpenPanel }: SortableIssueProps) {
  const uniqueId = `${issue.repository?.full_name || 'unknown'}-${issue.number}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const displayLabels = issue.labels.filter(l => !l.name.startsWith('status:'));

  const handleClick = (e: React.MouseEvent) => {
    if (!isSortableDragging) {
      e.stopPropagation();
      onOpenPanel?.(issue);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-surface border border-border p-4 group hover:border-border-strong transition-colors cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
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
          {displayLabels.slice(0, 2).map((label) => (
            <span
              key={label.id || label.name}
              className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono border"
              style={{
                backgroundColor: `#${label.color}20`,
                borderColor: `#${label.color}40`,
                color: `#${label.color}`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1">
            {(issue.assignees || []).slice(0, 3).map((assignee) => (
              assignee.avatar_url ? (
                <img
                  key={assignee.id}
                  src={assignee.avatar_url}
                  alt={assignee.login}
                  className="w-5 h-5 rounded-full border border-border"
                  referrerPolicy="no-referrer"
                  title={`Assignee: ${assignee.login}`}
                />
              ) : (
                <div
                  key={assignee.id}
                  className="w-5 h-5 rounded-full border border-border bg-surface-hover flex items-center justify-center"
                  title={`Assignee: ${assignee.login}`}
                >
                  <User className="w-3 h-3 text-text-dim" />
                </div>
              )
            ))}
            {(issue.assignees || []).length === 0 && (
              <span className="text-[10px] text-text-dim italic">Unassigned</span>
            )}
          </div>
          {issue.user && (
            <img
              src={issue.user.avatar_url}
              alt={issue.user.login}
              className="w-5 h-5 rounded-full border border-border"
              referrerPolicy="no-referrer"
              title={`Author: ${issue.user.login}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue, isOverlay }: { issue: Issue; isOverlay?: boolean }) {
  const displayLabels = issue.labels.filter(l => !l.name.startsWith('status:'));
  
  return (
    <div
      className={cn(
        "bg-surface border border-border p-4 group hover:border-border-strong transition-colors cursor-grab active:cursor-grabbing touch-none",
        isOverlay && "shadow-xl scale-105 opacity-90 pointer-events-none"
      )}
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
          {displayLabels.slice(0, 2).map((label) => (
            <span
              key={label.id || label.name}
              className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono border"
              style={{
                backgroundColor: `#${label.color}20`,
                borderColor: `#${label.color}40`,
                color: `#${label.color}`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1">
            {(issue.assignees || []).slice(0, 3).map((assignee) => (
              assignee.avatar_url ? (
                <img
                  key={assignee.id}
                  src={assignee.avatar_url}
                  alt={assignee.login}
                  className="w-5 h-5 rounded-full border border-border"
                  referrerPolicy="no-referrer"
                  title={`Assignee: ${assignee.login}`}
                />
              ) : (
                <div
                  key={assignee.id}
                  className="w-5 h-5 rounded-full border border-border bg-surface-hover flex items-center justify-center"
                  title={`Assignee: ${assignee.login}`}
                >
                  <User className="w-3 h-3 text-text-dim" />
                </div>
              )
            ))}
            {(issue.assignees || []).length === 0 && (
              <span className="text-[10px] text-text-dim italic">Unassigned</span>
            )}
          </div>
          {issue.user && (
            <img
              src={issue.user.avatar_url}
              alt={issue.user.login}
              className="w-5 h-5 rounded-full border border-border"
              referrerPolicy="no-referrer"
              title={`Author: ${issue.user.login}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Column({
  column,
  isOver,
  onDragOver,
  onOpenPanel,
  onAddIssue,
}: {
  column: Column;
  isOver: boolean;
  onDragOver?: (over: boolean) => void;
  onOpenPanel?: (issue: Issue) => void;
  onAddIssue?: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 flex flex-col bg-transparent transition-all duration-200 rounded-lg border-2 border-transparent",
        isOver && "bg-surface-hover border-primary border-dashed"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(true);
      }}
      onDragLeave={() => onDragOver?.(false)}
      onDrop={() => onDragOver?.(false)}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-mono text-[12px] font-bold text-text-dim tracking-widest uppercase">
          {column.title}{" "}
          <span className="ml-2 text-[10px] opacity-40 font-normal">
            {column.issues.length}
          </span>
        </h2>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const menu = e.currentTarget.nextElementSibling as HTMLElement;
              menu.classList.toggle("hidden");
            }}
            className="p-1 hover:bg-surface-hover rounded transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-text-dim" />
          </button>
          <div className="hidden absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-sm shadow-xl z-50 py-1">
            <button className="w-full px-3 py-2 text-left text-sm text-text-main hover:bg-surface-hover transition-colors">
              Rename column
            </button>
            <button className="w-full px-3 py-2 text-left text-sm text-text-main hover:bg-surface-hover transition-colors">
              Clear column
            </button>
            <div className="border-t border-border my-1" />
            <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-hover transition-colors">
              Delete column
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 min-h-50">
        <SortableContext
          items={column.issues.map((i) => `${i.repository?.full_name || 'unknown'}-${i.number}`)}
          strategy={verticalListSortingStrategy}
        >
          {column.issues.map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ y: -2 }}
              className={cn(
                "mb-3",
                column.id === "in-progress" && "[&>div]:border-l-2 [&>div]:border-l-primary"
              )}
            >
              <SortableIssue issue={issue} onOpenPanel={onOpenPanel} />
            </motion.div>
          ))}
        </SortableContext>

        <button 
          onClick={onAddIssue}
          className="w-full py-3 font-mono text-[11px] text-text-dim hover:text-primary hover:bg-surface-hover transition-all flex items-center justify-center gap-2 border border-dashed border-border"
        >
          <Plus className="w-3 h-3" />
          ADD ISSUE
        </button>
      </div>
    </div>
  );
}

export function Board() {
  const { activeProject } = useProjects();
  const { openPanel } = useSidebar();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const scopedIssues = filterIssuesByProject(issues, activeProject);

  const getIssuesInColumn = useCallback(
    (columnId: string) => {
      return scopedIssues.filter((issue) => {
        const hasStatusLabel = (label: { name: string }) =>
          label.name === STATUS_LABELS.backlog ||
          label.name === STATUS_LABELS["in-progress"] ||
          label.name === STATUS_LABELS.done;

        const statusLabel = issue.labels.find(hasStatusLabel);

        if (statusLabel) {
          // If issue has explicit status label, use it
          if (columnId === "backlog") return statusLabel.name === STATUS_LABELS.backlog;
          if (columnId === "in-progress")
            return statusLabel.name === STATUS_LABELS["in-progress"];
          if (columnId === "done") return statusLabel.name === STATUS_LABELS.done;
          return false;
        }

        // No status label - use default logic based on state and labels
        if (columnId === "backlog") return issue.state === "open";
        if (columnId === "in-progress") return false; // No longer use label count for default
        if (columnId === "done") return issue.state === "closed";
        return false;
      });
    },
    [scopedIssues]
  );

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
    
    // Set up polling to refresh issues every 5 seconds for live updates
    const pollInterval = setInterval(() => {
      fetchIssues();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const columns: Column[] = [
    {
      id: "backlog",
      title: "Backlog",
      issues: getIssuesInColumn("backlog"),
    },
    {
      id: "in-progress",
      title: "In Progress",
      issues: getIssuesInColumn("in-progress"),
    },
    {
      id: "done",
      title: "Done",
      issues: getIssuesInColumn("done"),
    },
  ];

  const activeIssue = activeId
    ? scopedIssues.find((i) => `${i.repository?.full_name || 'unknown'}-${i.number}` === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id?.toString();
    if (!overId) {
      setOverColumn(null);
      return;
    }

    // Check if dropping on a column directly
    if (overId === "backlog" || overId === "in-progress" || overId === "done") {
      setOverColumn(overId);
      return;
    }

    // Check if dropping on an issue, find which column it's in
    for (const col of columns) {
      const uniqueId = `${col.issues[0]?.repository?.full_name || 'unknown'}-${col.issues[0]?.number || ''}`;
      const inColumn = col.issues.find((i) => `${i.repository?.full_name || 'unknown'}-${i.number}` === overId);
      if (inColumn) {
        setOverColumn(col.id);
        return;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;

    const overId = over.id.toString();
    const activeIssueId = active.id.toString();
    const activeIssue = scopedIssues.find((i) => `${i.repository?.full_name || 'unknown'}-${i.number}` === activeIssueId);
    if (!activeIssue) return;

    let targetColumn: string | null = null;

    // Check if dropping on a column directly
    if (overId === "backlog" || overId === "in-progress" || overId === "done") {
      targetColumn = overId;
    } else {
      // Check if dropping on an issue, find which column it's in
      for (const col of columns) {
        const inColumn = col.issues.find((i) => `${i.repository?.full_name || 'unknown'}-${i.number}` === overId);
        if (inColumn) {
          targetColumn = col.id;
          break;
        }
      }
    }

    if (!targetColumn) return;

    const currentColumn = columns.find((col) =>
      col.issues.some((i) => `${i.repository?.full_name || 'unknown'}-${i.number}` === activeIssueId)
    );

    if (currentColumn?.id === targetColumn) return;

    const issueToUpdate = { ...activeIssue };
    let newLabels: string[] = [];

    if (targetColumn === "backlog") {
      // Keep existing non-status labels when moving to Backlog
      newLabels = issueToUpdate.labels
        .map((l) => l.name)
        .filter(
          (l) =>
            l !== STATUS_LABELS.backlog &&
            l !== STATUS_LABELS["in-progress"] &&
            l !== STATUS_LABELS.done
        );
      // Don't add any status label - Backlog means no status label
    } else if (targetColumn === "done") {
      // Keep existing non-status labels when moving to Done
      newLabels = issueToUpdate.labels
        .map((l) => l.name)
        .filter(
          (l) =>
            l !== STATUS_LABELS.backlog &&
            l !== STATUS_LABELS["in-progress"] &&
            l !== STATUS_LABELS.done
        );
      newLabels.push(STATUS_LABELS.done);
    } else {
      // Moving to In Progress - keep non-status labels, add status label
      newLabels = issueToUpdate.labels
        .map((l) => l.name)
        .filter(
          (l) =>
            l !== STATUS_LABELS.backlog &&
            l !== STATUS_LABELS["in-progress"] &&
            l !== STATUS_LABELS.done
        );
      newLabels.push(STATUS_LABELS["in-progress"]);
    }

    const newState = targetColumn === "done" ? "closed" : "open";

    setUpdating((prev) => [...prev, activeIssue.id]);
    setError(null);

    const previousIssues = [...issues];
    setIssues((prev) =>
      prev.map((i) =>
        i.id === activeIssue.id
          ? {
              ...i,
              state: newState,
              labels: newLabels.map((name) => {
                const existingLabel = issueToUpdate.labels.find((l) => l.name === name);
                return existingLabel || { id: 0, name, color: "22c55e", description: "" };
              }),
            }
          : i
      )
    );

    try {
      const repoUrl = issueToUpdate.repository_url || issueToUpdate.repository?.html_url;
      if (!repoUrl) {
        throw new Error("No repository URL found");
      }
      const owner = repoUrl.split("/").slice(-2, -1)[0];
      const repo = repoUrl.split("/").slice(-1)[0];

      if (newState !== issueToUpdate.state) {
        await fetch(`/api/github/issues/${owner}/${repo}/${issueToUpdate.number}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: newState }),
        });
      }

      // Always update labels - either to set new status label, or to clear them for Backlog
      const hadStatusLabel = issueToUpdate.labels.some(
        (l) =>
          l.name === STATUS_LABELS.backlog ||
          l.name === STATUS_LABELS["in-progress"] ||
          l.name === STATUS_LABELS.done
      );
      if (newLabels.length > 0 || hadStatusLabel || targetColumn === "backlog") {
        await fetch(
          `/api/github/issues/${owner}/${repo}/${issueToUpdate.number}/labels`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ labels: newLabels }),
          }
        );
      }
    } catch (err) {
      console.error("Failed to update issue:", err);
      setIssues(previousIssues);
      setError("Failed to move issue. Please try again.");
    } finally {
      setUpdating((prev) => prev.filter((id) => id !== activeIssue.id));
    }
  };

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
            Link repositories to {activeProject.name} from the Projects page to
            populate this board.
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
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              isOver={overColumn === col.id}
              onDragOver={(over) => setOverColumn(over ? col.id : null)}
              onOpenPanel={openPanel}
              onAddIssue={() => setIsCreateModalOpen(true)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeIssue ? <IssueCard issue={activeIssue} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
      
      <CreateIssueModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          fetch("/api/github/issues")
            .then(res => res.json())
            .then(data => setIssues(data));
        }}
      />
    </div>
  );
}
