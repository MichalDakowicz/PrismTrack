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
  Settings2,
  Users,
  Bell,
  Github,
  Building2
} from "lucide-react";
import { cn } from "../lib/utils";
import { useProjects } from "../contexts/ProjectContext";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserProfileMenu } from "./UserProfileMenu";
import { useFilterPresets, FILTER_PRESETS } from "../hooks/useFilterPresets";

export function Sidebar() {
  const { activeProject } = useProjects();
  const { isActive, toggleFilter } = useFilterPresets();

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
            Settings
          </h3>
          <div className="space-y-0.5">
            <NavLink
              to="/settings/workspace"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-2 py-1 rounded-sm transition-all",
                isActive 
                  ? "bg-surface-hover text-primary" 
                  : "text-text-dim hover:text-text-main hover:bg-surface-hover"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-[13px]">Workspace</span>
            </NavLink>
            <NavLink
              to="/settings/github-app"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-2 py-1 rounded-sm transition-all",
                isActive 
                  ? "bg-surface-hover text-primary" 
                  : "text-text-dim hover:text-text-main hover:bg-surface-hover"
              )}
            >
              <Github className="w-4 h-4" />
              <span className="text-[13px]">GitHub App</span>
            </NavLink>
            <NavLink
              to="/settings/members"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-2 py-1 rounded-sm transition-all",
                isActive 
                  ? "bg-surface-hover text-primary" 
                  : "text-text-dim hover:text-text-main hover:bg-surface-hover"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-[13px]">Members</span>
            </NavLink>
            <NavLink
              to="/settings/notifications"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-2 py-1 rounded-sm transition-all",
                isActive 
                  ? "bg-surface-hover text-primary" 
                  : "text-text-dim hover:text-text-main hover:bg-surface-hover"
              )}
            >
              <Bell className="w-4 h-4" />
              <span className="text-[13px]">Notifications</span>
            </NavLink>
          </div>
        </div>

        <div className="pt-4 px-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-dim mb-3">
            Custom Filters
          </h3>
          <div className="space-y-1">
            {FILTER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => toggleFilter(preset.id)}
                className={cn(
                  "flex items-center gap-2 w-full text-[13px] group transition-colors px-1 rounded-sm",
                  isActive(preset.id) 
                    ? "text-text-main bg-surface-hover" 
                    : "text-text-dim hover:text-text-main"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full transition-opacity", preset.color, isActive(preset.id) ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <UserProfileMenu />
    </aside>
  );
}
