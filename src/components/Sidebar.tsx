import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CircleDot, 
  GitPullRequest, 
  GitBranch,
  FolderGit2,
  Kanban,
  List,
  CalendarRange,
  Activity,
  Signal,
  Settings2
} from "lucide-react";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserProfileMenu } from "./UserProfileMenu";

export function Sidebar() {
  const { activeProject } = useProjects();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: CircleDot, label: "My Issues", href: "/my-issues" },
    { icon: GitPullRequest, label: "Pull Requests", href: "/pull-requests" },
    { icon: GitBranch, label: "Branches", href: "/branches" },
    { icon: FolderGit2, label: "Repositories", href: "/repositories" },
  ];

  const projectViews = [
    { icon: Kanban, label: "Board", key: "board" },
    { icon: List, label: "List", key: "list" },
    { icon: CalendarRange, label: "Timeline", key: "timeline" },
    { icon: Activity, label: "Activity", key: "activity" },
    { icon: Signal, label: "Pulse", key: "pulse" },
    { icon: Settings2, label: "Settings", key: "settings" },
  ];

  return (
    <aside className="w-60 shrink-0 bg-surface-well border-r border-border flex flex-col h-full overflow-hidden">
      <ProjectSwitcher />

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-1.5 rounded-sm transition-all group relative",
              isActive 
                ? "bg-surface-hover text-primary" 
                : "text-text-dim hover:text-text-main hover:bg-surface-hover"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                )}
                <item.icon className="w-4.5 h-4.5" />
                <span className="text-[14px] font-medium tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {activeProject &&
          projectViews.map((view) => (
            <NavLink
              key={view.key}
              to={`/projects/${activeProject.id}/${view.key}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-sm transition-all group relative",
                  isActive
                    ? "bg-surface-hover text-primary"
                    : "text-text-dim hover:text-text-main hover:bg-surface-hover"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                  <view.icon className="w-4.5 h-4.5" />
                  <span className="text-[14px] font-medium tracking-tight">{view.label}</span>
                </>
              )}
            </NavLink>
          ))}

        <div className="pt-8 px-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-dim mb-3">
            Custom Filters
          </h3>
          <div className="space-y-1">
            <button className="flex items-center gap-2 w-full text-[13px] text-text-dim hover:text-text-main group transition-colors px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-70 group-hover:opacity-100" />
              <span>My Bugs</span>
            </button>
            <button className="flex items-center gap-2 w-full text-[13px] text-text-dim hover:text-text-main group transition-colors px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-70 group-hover:opacity-100" />
              <span>Urgent</span>
            </button>
          </div>
        </div>
      </nav>

      <UserProfileMenu />
    </aside>
  );
}
