import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpDown, Check } from "lucide-react";
import { cn } from "../lib/utils";

export type SortOption = "newest" | "oldest" | "recently_updated" | "least_recently_updated";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "least_recently_updated", label: "Least Recently Updated" },
];

interface SortFilterPopoverProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortFilterPopover({ value, onChange, className }: SortFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = SORT_OPTIONS.find(o => o.value === value)?.label || "Sort";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-border border border-border rounded-sm text-sm font-mono text-text-main transition-colors"
      >
        <ArrowUpDown className="w-4 h-4" />
        Sort
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-surface border border-border rounded-sm shadow-xl z-50 py-1"
          >
            <div className="px-3 py-2 text-[11px] font-mono uppercase text-text-dim tracking-wider border-b border-border">
              Sort by
            </div>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-hover transition-colors",
                  value === option.value && "text-primary"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function sortItems<T extends { created_at: string; updated_at: string }>(
  items: T[],
  sortBy: SortOption
): T[] {
  const sorted = [...items];
  
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case "recently_updated":
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    case "least_recently_updated":
      return sorted.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    default:
      return sorted;
  }
}
