import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Calendar, User, Tag, Users, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Issue } from "../../types";
import { useIssueDetailPanel } from "./useIssueDetailPanel";
import { StatusPicker } from "./StatusPicker";
import { LabelPicker } from "./LabelPicker";
import { EditableTitle } from "./EditableTitle";
import { EditableDescription } from "./EditableDescription";
import { Notification } from "./Notification";
import { ConfirmModal } from "../ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";

interface IssueDetailPanelProps {
    onStateChange?: (issue: Issue) => void;
}

export function IssueDetailPanel({ onStateChange }: IssueDetailPanelProps) {
    const hook = useIssueDetailPanel({ onStateChange });
    const { user } = useAuth();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
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
    } = hook;

    const canDeleteIssue = user && selectedIssue && selectedIssue.repository && user.login === selectedIssue.repository.owner.login;

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") updateTitle();
        if (e.key === "Escape") {
            setEditTitle(selectedIssue!.title);
            setIsEditingTitle(false);
        }
    };

    const handleDescriptionCancel = () => {
        setEditBody(selectedIssue.body || "");
        setIsEditingBody(false);
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && selectedIssue && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePanel}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9000]"
                    />
                    <motion.div
                        key="panel"
                        ref={panelRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{ width: panelWidth, minWidth: panelWidth }}
                        className="fixed right-0 top-0 bottom-0 bg-surface border-l border-border shadow-2xl z-[9001] flex flex-col"
                    >
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                    }}
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
                />

                <div className="flex items-center justify-between p-4 border-b border-border bg-background shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-text-dim">#{selectedIssue.number}</span>
                        <StatusPicker
                            issue={selectedIssue}
                            getCurrentStatusLabel={getCurrentStatusLabel}
                            updateStatus={updateStatus}
                            showStatusPicker={showStatusPicker}
                            setShowStatusPicker={setShowStatusPicker}
                            updatingStatus={updatingStatus}
                            statusPickerRef={statusPickerRef}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={selectedIssue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-text-dim hover:text-primary transition-colors"
                            title="Open in GitHub"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        {canDeleteIssue && (
                            <button 
                                onClick={() => setDeleteConfirmOpen(true)}
                                className="p-2 text-text-dim hover:text-red-400 transition-colors"
                                title="Delete issue"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={closePanel} className="p-2 text-text-dim hover:text-text-main transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {notification && <Notification notification={notification} />}

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <EditableTitle
                            title={editTitle}
                            isEditing={isEditingTitle}
                            isUpdating={updatingTitle}
                            onEdit={() => setIsEditingTitle(true)}
                            onCancel={() => {
                                setEditTitle(selectedIssue.title);
                                setIsEditingTitle(false);
                            }}
                            onSave={updateTitle}
                            onChange={setEditTitle}
                            onKeyDown={handleTitleKeyDown}
                        />
                        {selectedIssue.repository && (
                            <a
                                href={selectedIssue.repository.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-text-dim hover:text-primary transition-colors"
                            >
                                {selectedIssue.repository.full_name}
                            </a>
                        )}
                    </div>

                    <EditableDescription
                        body={editBody}
                        originalBody={selectedIssue.body || ""}
                        isEditing={isEditingBody}
                        isUpdating={updatingBody}
                        onEdit={() => setIsEditingBody(true)}
                        onCancel={handleDescriptionCancel}
                        onSave={updateBody}
                        onChange={setEditBody}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-text-dim" />
                            <span className="text-xs text-text-dim">Author</span>
                        </div>
                        <div className="flex items-center gap-3 pl-6">
                            <img
                                src={selectedIssue.user.avatar_url}
                                alt={selectedIssue.user.login}
                                className="w-6 h-6 rounded-full border border-border"
                                referrerPolicy="no-referrer"
                            />
                            <span className="text-sm text-text-main">{selectedIssue.user.login}</span>
                        </div>
                    </div>

                    {(selectedIssue.assignees || []).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-text-dim" />
                                <span className="text-xs text-text-dim">Assignees</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-6">
                                {selectedIssue.assignees.map((assignee) => (
                                    <div
                                        key={assignee.id}
                                        className="flex items-center gap-2 px-2 py-1 bg-surface-hover rounded-sm border border-border"
                                    >
                                        {assignee.avatar_url ? (
                                            <img
                                                src={assignee.avatar_url}
                                                alt={assignee.login}
                                                className="w-5 h-5 rounded-full"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-text-dim" />
                                        )}
                                        <span className="text-sm text-text-main">{assignee.login}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-text-dim" />
                                <span className="text-xs text-text-dim">Labels</span>
                            </div>
                            <LabelPicker
                                labels={availableLabels}
                                issueLabels={selectedIssue.labels}
                                loading={labelsLoading}
                                showPicker={showLabelPicker}
                                setShowPicker={setShowLabelPicker}
                                updating={updatingLabels}
                                onToggle={toggleLabel}
                                pickerRef={labelPickerRef}
                            />
                        </div>
                        {selectedIssue.labels.filter((l) => !l.name.startsWith("status:")).length > 0 ? (
                            <div className="flex flex-wrap gap-2 pl-6">
                                {selectedIssue.labels
                                    .filter((l) => !l.name.startsWith("status:"))
                                    .map((label) => (
                                        <span
                                            key={label.id}
                                            className="px-2 py-1 rounded-sm text-xs font-mono border"
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
                        ) : (
                            <p className="text-xs text-text-dim pl-6 italic">No labels</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-text-dim" />
                            <span className="text-xs text-text-dim">Timeline</span>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                            <div className="text-text-dim">
                                Created {formatDistanceToNow(new Date(selectedIssue.created_at), { addSuffix: true })}
                            </div>
                            <div className="text-text-dim">
                                Updated {formatDistanceToNow(new Date(selectedIssue.updated_at), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            <ConfirmModal
                isOpen={deleteConfirmOpen}
                title="Delete Issue"
                message={`Are you sure you want to delete issue #${selectedIssue.number}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                isLoading={isDeleting}
                onConfirm={async () => {
                    setIsDeleting(true);
                    try {
                        await hook.deleteIssue();
                        setDeleteConfirmOpen(false);
                    } finally {
                        setIsDeleting(false);
                    }
                }}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
