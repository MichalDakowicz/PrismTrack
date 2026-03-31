import { motion, AnimatePresence } from "motion/react";
import { Plus, Loader2, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { Label } from "../../types";

interface LabelPickerProps {
    labels: Label[];
    issueLabels: Label[];
    loading: boolean;
    showPicker: boolean;
    setShowPicker: (show: boolean) => void;
    updating: boolean;
    onToggle: (labelName: string) => void;
    pickerRef: React.RefObject<HTMLDivElement | null>;
}

export function LabelPicker({
    labels,
    issueLabels,
    loading,
    showPicker,
    setShowPicker,
    updating,
    onToggle,
    pickerRef,
}: LabelPickerProps) {
    const filteredLabels = labels.filter((l) => !l.name.startsWith("status:"));
    const filteredIssueLabels = issueLabels.filter((l) => !l.name.startsWith("status:"));

    return (
        <div ref={pickerRef} className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                disabled={updating}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono bg-surface-hover hover:bg-border border border-border rounded-sm transition-colors disabled:opacity-50"
            >
                {updating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <>
                        <Plus className="w-3 h-3" />
                        <span>Edit</span>
                    </>
                )}
            </button>
            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full mt-1 w-56 max-h-64 overflow-y-auto bg-surface border border-border rounded-sm shadow-xl z-50 py-1"
                    >
                        {loading ? (
                            <div className="px-3 py-4 text-center text-xs text-text-dim">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            </div>
                        ) : filteredLabels.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-text-dim">
                                No labels available
                            </div>
                        ) : (
                            filteredLabels.map((label) => {
                                const hasLabel = filteredIssueLabels.some((l) => l.name === label.name);
                                return (
                                    <button
                                        key={label.id}
                                        onClick={() => onToggle(label.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-hover transition-colors",
                                            hasLabel && "text-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full border"
                                                style={{ backgroundColor: `#${label.color}` }}
                                            />
                                            <span className="truncate max-w-[140px]">{label.name}</span>
                                        </div>
                                        {hasLabel && <Check className="w-4 h-4 shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
