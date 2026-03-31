import { useRef, useEffect } from "react";
import { Pencil, Loader2, Check, X } from "lucide-react";

interface EditableTitleProps {
    title: string;
    isEditing: boolean;
    isUpdating: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function EditableTitle({
    title,
    isEditing,
    isUpdating,
    onEdit,
    onCancel,
    onSave,
    onChange,
    onKeyDown,
}: EditableTitleProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (isEditing) {
        return (
            <div className="flex-1 flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 bg-surface-well border border-border rounded-sm px-3 py-2 text-lg font-semibold text-text-main focus:outline-none focus:border-primary"
                />
                <button
                    onClick={onSave}
                    disabled={isUpdating}
                    className="p-2 bg-primary text-on-primary rounded-sm hover:bg-primary/90 disabled:opacity-50"
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={onCancel} className="p-2 text-text-dim hover:text-text-main">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 flex-1">
            <h2
                className="flex-1 text-lg font-semibold text-text-main cursor-pointer hover:text-primary transition-colors"
                onClick={onEdit}
            >
                {title}
            </h2>
            <button
                onClick={onEdit}
                className="p-1.5 text-text-dim hover:text-primary hover:bg-surface-hover rounded-sm transition-colors"
                title="Edit title"
            >
                <Pencil className="w-4 h-4" />
            </button>
        </div>
    );
}
