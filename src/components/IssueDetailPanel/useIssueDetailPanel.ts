import { useState, useEffect, useRef, useCallback } from "react";
import { Issue, Label } from "../../types";
import { useSidebar } from "../../contexts/SidebarContext";
import { getRepositoryFullName } from "../../lib/projectSelectors";
import { usePopups } from "../../hooks/usePopups";

export const STATUS_LABELS = {
    backlog: "status:backlog",
    "in-progress": "status:in-progress",
    done: "status:done",
} as const;

export type StatusKey = keyof typeof STATUS_LABELS;

interface UseIssueDetailPanelOptions {
    onStateChange?: (issue: Issue) => void;
}

export function useIssueDetailPanel({ onStateChange }: UseIssueDetailPanelOptions = {}) {
    const { isOpen, selectedIssue, closePanel } = useSidebar();
    const popups = usePopups();
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
    const [labelsLoading, setLabelsLoading] = useState(false);
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [updatingLabels, setUpdatingLabels] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingBody, setIsEditingBody] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editBody, setEditBody] = useState("");
    const [updatingTitle, setUpdatingTitle] = useState(false);
    const [updatingBody, setUpdatingBody] = useState(false);
    const [panelWidth, setPanelWidth] = useState(480);
    const [isResizing, setIsResizing] = useState(false);
    const labelPickerRef = useRef<HTMLDivElement>(null);
    const statusPickerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const repoFullName =
        selectedIssue?.repository?.full_name ||
        (selectedIssue ? getRepositoryFullName(selectedIssue.repository_url) : null);

    useEffect(() => {
        if (selectedIssue) {
            setEditTitle(selectedIssue.title);
            setEditBody(selectedIssue.body || "");
        }
    }, [selectedIssue?.id]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !panelRef.current) return;
            const newWidth = window.innerWidth - e.clientX;
            const clampedWidth = Math.max(320, Math.min(800, newWidth));
            setPanelWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        if (isResizing) {
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) closePanel();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, closePanel]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (labelPickerRef.current && !labelPickerRef.current.contains(e.target as Node)) {
                setShowLabelPicker(false);
            }
            if (statusPickerRef.current && !statusPickerRef.current.contains(e.target as Node)) {
                setShowStatusPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && repoFullName && selectedIssue) {
            const [owner, repo] = repoFullName.split("/");
            setLabelsLoading(true);
            fetch(`/api/github/repos/${owner}/${repo}/labels`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setAvailableLabels(data);
                })
                .catch(() => setAvailableLabels([]))
                .finally(() => setLabelsLoading(false));
        }
    }, [isOpen, repoFullName, selectedIssue?.id]);

    const showNotification = useCallback((type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const getCurrentStatusLabel = useCallback((): string | null => {
        if (!selectedIssue) return null;
        return (
            selectedIssue.labels.find(
                (l) =>
                    l.name === STATUS_LABELS.backlog ||
                    l.name === STATUS_LABELS["in-progress"] ||
                    l.name === STATUS_LABELS.done
            )?.name || null
        );
    }, [selectedIssue]);

    const updateTitle = useCallback(async () => {
        if (!selectedIssue || !repoFullName || !editTitle.trim()) return;
        const [owner, repo] = repoFullName.split("/");
        setUpdatingTitle(true);
        try {
            const res = await fetch(`/api/github/issues/${owner}/${repo}/${selectedIssue.number}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle.trim() }),
            });
            if (res.ok) {
                const updatedIssue = { ...selectedIssue, title: editTitle.trim() };
                showNotification("success", "Title updated");
                onStateChange?.(updatedIssue);
                setIsEditingTitle(false);
            } else {
                showNotification("error", "Failed to update title");
            }
        } catch {
            showNotification("error", "Failed to update title");
        } finally {
            setUpdatingTitle(false);
        }
    }, [selectedIssue, repoFullName, editTitle, onStateChange, showNotification]);

    const updateBody = useCallback(async () => {
        if (!selectedIssue || !repoFullName) return;
        const [owner, repo] = repoFullName.split("/");
        setUpdatingBody(true);
        try {
            const res = await fetch(`/api/github/issues/${owner}/${repo}/${selectedIssue.number}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: editBody }),
            });
            if (res.ok) {
                const updatedIssue = { ...selectedIssue, body: editBody };
                showNotification("success", "Description updated");
                onStateChange?.(updatedIssue);
                setIsEditingBody(false);
            } else {
                showNotification("error", "Failed to update description");
            }
        } catch {
            showNotification("error", "Failed to update description");
        } finally {
            setUpdatingBody(false);
        }
    }, [selectedIssue, repoFullName, editBody, onStateChange, showNotification]);

    const updateLabels = useCallback(async (labelNames: string[]) => {
        if (!selectedIssue || !repoFullName) return;
        const [owner, repo] = repoFullName.split("/");
        setUpdatingLabels(true);
        try {
            const res = await fetch(`/api/github/issues/${owner}/${repo}/${selectedIssue.number}/labels`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ labels: labelNames }),
            });
            if (res.ok) {
                const updatedLabels = availableLabels.filter((l) => labelNames.includes(l.name));
                const updatedIssue = { ...selectedIssue, labels: updatedLabels };
                showNotification("success", "Labels updated");
                onStateChange?.(updatedIssue);
            } else {
                showNotification("error", "Failed to update labels");
            }
        } catch {
            showNotification("error", "Failed to update labels");
        } finally {
            setUpdatingLabels(false);
            setShowLabelPicker(false);
        }
    }, [selectedIssue, repoFullName, availableLabels, onStateChange, showNotification]);

    const toggleLabel = useCallback((labelName: string) => {
        if (!selectedIssue) return;
        const currentLabels = selectedIssue.labels.map((l) => l.name);
        const hasLabel = currentLabels.includes(labelName);
        const newLabels = hasLabel
            ? currentLabels.filter((l) => l !== labelName)
            : [...currentLabels, labelName];
        updateLabels(newLabels);
    }, [selectedIssue, updateLabels]);

    const updateStatus = useCallback(async (statusKey: StatusKey) => {
        if (!selectedIssue || !repoFullName) return;
        const [owner, repo] = repoFullName.split("/");
        setUpdatingStatus(true);

        const currentLabels = selectedIssue.labels.map((l) => l.name);
        const newLabels = currentLabels.filter(
            (l) => l !== STATUS_LABELS.backlog && l !== STATUS_LABELS["in-progress"] && l !== STATUS_LABELS.done
        );
        if (statusKey !== "backlog") newLabels.push(STATUS_LABELS[statusKey]);

        const newState: "open" | "closed" = statusKey === "done" ? "closed" : "open";

        try {
            const res = await fetch(`/api/github/issues/${owner}/${repo}/${selectedIssue.number}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: newState, labels: newLabels }),
            });
            if (res.ok) {
                const updatedLabels = availableLabels.filter((l) => newLabels.includes(l.name));
                const updatedIssue = { ...selectedIssue, state: newState, labels: updatedLabels };
                showNotification("success", statusKey === "done" ? "Issue completed" : `Status updated to ${statusKey}`);
                onStateChange?.(updatedIssue);
            } else {
                showNotification("error", "Failed to update status");
            }
        } catch {
            showNotification("error", "Failed to update status");
        } finally {
            setUpdatingStatus(false);
            setShowStatusPicker(false);
        }
    }, [selectedIssue, repoFullName, availableLabels, onStateChange, showNotification]);

    const deleteIssue = useCallback(async () => {
        if (!selectedIssue || !repoFullName) return;
        const [owner, repo] = repoFullName.split("/");
        setUpdatingStatus(true);

        try {
            const res = await fetch(`/api/github/issues/${owner}/${repo}/${selectedIssue.number}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                popups.success("Issue deleted", `Issue #${selectedIssue.number} was deleted.`);
                closePanel();
            } else {
                popups.error("Delete failed", "Failed to delete issue.");
            }
        } catch {
            popups.error("Delete failed", "Failed to delete issue.");
        } finally {
            setUpdatingStatus(false);
        }
    }, [selectedIssue, repoFullName, popups, closePanel]);

    return {
        isOpen,
        selectedIssue,
        closePanel,
        notification,
        availableLabels,
        labelsLoading,
        showLabelPicker,
        setShowLabelPicker,
        showStatusPicker,
        setShowStatusPicker,
        updatingLabels,
        updatingStatus,
        isEditingTitle,
        setIsEditingTitle,
        isEditingBody,
        setIsEditingBody,
        editTitle,
        setEditTitle,
        editBody,
        setEditBody,
        updatingTitle,
        updatingBody,
        panelWidth,
        isResizing,
        setIsResizing,
        labelPickerRef,
        statusPickerRef,
        titleInputRef,
        panelRef,
        getCurrentStatusLabel,
        updateTitle,
        updateBody,
        toggleLabel,
        updateStatus,
        deleteIssue,
    };
}
