import ReactMarkdown from "react-markdown";
import { Pencil, Eye, Loader2, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface EditableDescriptionProps {
    body: string | null;
    originalBody: string;
    isEditing: boolean;
    isUpdating: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (value: string) => void;
}

export function EditableDescription({
    body,
    originalBody,
    isEditing,
    isUpdating,
    onEdit,
    onCancel,
    onSave,
    onChange,
}: EditableDescriptionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-text-dim uppercase tracking-wider">Description</span>
                <button
                    onClick={onEdit}
                    className={cn(
                        "flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-sm transition-colors",
                        isEditing
                            ? "bg-primary/20 text-primary"
                            : "text-text-dim hover:text-primary hover:bg-surface-hover"
                    )}
                    title={isEditing ? "Preview" : "Edit"}
                >
                    {isEditing ? <Eye className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                    <span>{isEditing ? "Preview" : "Edit"}</span>
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        value={body}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Add a description..."
                        className="w-full h-48 bg-surface-well border border-border rounded-sm p-4 text-sm text-text-main focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 text-sm font-mono text-text-dim hover:text-text-main transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-on-primary text-sm font-mono rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="bg-surface-well border border-border rounded-sm p-4 min-h-[80px] cursor-pointer hover:border-border-strong transition-colors"
                    onClick={onEdit}
                >
                    {body ? (
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="text-sm text-text-main my-2 first:mt-0 last:mb-0">{children}</p>,
                                code: ({ children }) => <code className="bg-surface rounded text-xs">{children}</code>,
                                pre: ({ children }) => <pre className="bg-background p-3 rounded-sm my-2">{children}</pre>,
                                ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
                                a: ({ children, href }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {body}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-sm text-text-dim italic">Click to add a description...</p>
                    )}
                </div>
            )}
        </div>
    );
}
