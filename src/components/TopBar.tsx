import { useLocation } from "react-router-dom";
import { Search, Bell, Terminal } from "lucide-react";

export function TopBar() {
  const location = useLocation();
  
  const getTitle = () => {
    if (location.pathname === "/projects") return "Projects";
    if (location.pathname.startsWith("/projects/")) {
      const tab = location.pathname.split("/")[3];
      switch (tab) {
        case "board": return "Project Board";
        case "list": return "Project List";
        case "timeline": return "Project Timeline";
        case "activity": return "Project Activity";
        case "pulse": return "Project Pulse";
        case "settings": return "Project Settings";
        default: return "Project";
      }
    }

    switch (location.pathname) {
      case "/": return "Overview";
      case "/my-issues": return "My Issues";
      case "/issues": return "Issues";
      case "/board": return "Board";
      case "/pull-requests": return "Pull Requests";
      case "/branches": return "Branches";
      case "/repositories": return "Repositories";
      case "/settings/workspace": return "Workspace Settings";
      case "/settings/github-app": return "GitHub App";
      case "/settings/members": return "Members";
      case "/settings/notifications": return "Notifications";
      default: return "PrismTrack";
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-[20px] font-semibold text-text-main tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input 
            type="text"
            placeholder="Search or jump to..."
            className="bg-surface-well border border-border rounded-sm py-1.5 pl-9 pr-4 text-xs font-mono text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="font-mono text-[10px] text-text-dim bg-surface border border-border rounded px-1">⌘</kbd>
            <kbd className="font-mono text-[10px] text-text-dim bg-surface border border-border rounded px-1">K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-text-dim hover:text-text-main transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 text-text-dim hover:text-text-main transition-colors">
            <Terminal className="w-4 h-4" />
          </button>
          <button className="bg-primary text-on-primary px-4 py-1.5 text-xs font-bold hover:bg-primary/90 transition-colors ml-2 rounded-sm">
            Deploy
          </button>
        </div>
      </div>
    </header>
  );
}
