import { useState, useEffect } from "react";

export type FilterPreset = "my-bugs" | "urgent" | null;

interface FilterPresetConfig {
  id: FilterPreset;
  label: string;
  color: string;
  filter: (labelName: string) => boolean;
}

export const FILTER_PRESETS: FilterPresetConfig[] = [
  { id: "my-bugs", label: "My Bugs", color: "bg-red-500", filter: (name) => name.toLowerCase().includes("bug") },
  { id: "urgent", label: "Urgent", color: "bg-orange-500", filter: (name) => name.toLowerCase().includes("urgent") || name.toLowerCase().includes("critical") },
];

const STORAGE_KEY = "prismtrack-active-filter";

export function useFilterPresets() {
  const [activeFilter, setActiveFilter] = useState<FilterPreset>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "my-bugs" || stored === "urgent")) {
      setActiveFilter(stored as FilterPreset);
    }
  }, []);

  const setFilter = (filter: FilterPreset) => {
    setActiveFilter(filter);
    if (filter) {
      localStorage.setItem(STORAGE_KEY, filter);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const toggleFilter = (filterId: FilterPreset) => {
    if (activeFilter === filterId) {
      setFilter(null);
    } else {
      setFilter(filterId);
    }
  };

  const isActive = (filterId: FilterPreset) => activeFilter === filterId;

  return {
    activeFilter,
    setFilter,
    toggleFilter,
    isActive,
  };
}
