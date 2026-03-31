import { motion, AnimatePresence } from "motion/react";
import { CircleDot, CheckCircle2, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { STATUS_LABELS, StatusKey } from "./useIssueDetailPanel";
import { Issue } from "../../types";

interface StatusPickerProps {
    issue: Issue;
    getCurrentStatusLabel: () => string | null;
    updateStatus: (status: StatusKey) => void;
    showStatusPicker: boolean;
    setShowStatusPicker: (show: boolean) => void;
    updatingStatus: boolean;
    statusPickerRef: React.RefObject<HTMLDivElement | null>;
}

export function StatusPicker({
    issue,
    getCurrentStatusLabel,
    updateStatus,
    showStatusPicker,
    setShowStatusPicker,
    updatingStatus,
    statusPickerRef,
}: StatusPickerProps) {
    return (
        <div ref={statusPickerRef} className="relative">
            <button
                onClick={() => setShowStatusPicker(!showStatusPicker)}
                disabled={updatingStatus}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono transition-colors disabled:opacity-50",
                    issue.state === "open"
                        ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                        : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20"
                )}
            >
                {issue.state === "open" ? (
                    <CircleDot className="w-4 h-4" />
                ) : (
                    <CheckCircle2 className="w-4 h-4" />
                )}
                {updatingStatus ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        <span>{getCurrentStatusLabel()?.replace("status:", "") || issue.state}</span>
                        <ChevronDown className="w-3 h-3" />
                    </>
                )}
            </button>
            <AnimatePresence>
                {showStatusPicker && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full mt-1 w-48 bg-surface border border-border rounded-sm shadow-xl z-50 py-1"
                    >
                        <div className="px-3 py-2 text-[10px] font-mono uppercase text-text-dim tracking-wider border-b border-border">
                            State
                        </div>
                        <button
                            onClick={() => updateStatus("backlog")}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover transition-colors",
                                issue.state === "open" && !getCurrentStatusLabel() && "text-primary"
                            )}
                        >
                            <CircleDot className="w-4 h-4 text-primary" />
                            <span>Open</span>
                        </button>
                        <button
                            onClick={() => updateStatus("in-progress")}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover transition-colors",
                                getCurrentStatusLabel() === STATUS_LABELS["in-progress"] && "text-primary"
                            )}
                        >
                            <RotateCcw className="w-4 h-4 text-primary" />
                            <span>In Progress</span>
                        </button>
                        <div className="border-t border-border my-1" />
                        <div className="px-3 py-2 text-[10px] font-mono uppercase text-text-dim tracking-wider">
                            Done
                        </div>
                        <button
                            onClick={() => updateStatus("done")}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover transition-colors",
                                getCurrentStatusLabel() === STATUS_LABELS.done && "text-primary"
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            <span>Done</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
