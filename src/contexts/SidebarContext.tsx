import { createContext, useContext, useState, ReactNode } from "react";
import { Issue } from "../types";

interface SidebarContextType {
  isOpen: boolean;
  selectedIssue: Issue | null;
  openPanel: (issue: Issue) => void;
  closePanel: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const openPanel = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setSelectedIssue(null);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, selectedIssue, openPanel, closePanel }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
