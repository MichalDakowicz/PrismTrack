import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Cog, Puzzle, Users, Bell, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const settingsLinks = [
    { icon: Cog, label: "Workspace", href: "/settings/workspace" },
    { icon: Puzzle, label: "GitHub App", href: "/settings/github-app" },
    { icon: Users, label: "Members", href: "/settings/members" },
    { icon: Bell, label: "Notifications", href: "/settings/notifications" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="p-4 border-t border-border shrink-0 relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full hover:bg-surface-hover p-1 rounded-sm transition-colors group"
      >
        <img
          src={user?.avatar_url}
          alt={user?.login}
          className="w-6 h-6 rounded-sm border border-border shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[13px] text-text-main font-medium truncate">{user?.login}</p>
        </div>
        <div className={cn(
          "text-text-dim transition-transform",
          isOpen && "rotate-180"
        )}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface-well border border-border rounded-sm shadow-lg z-50">
          <div className="p-2 space-y-1">
            {settingsLinks.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-sm text-[13px] transition-colors",
                    isActive
                      ? "bg-surface-hover text-primary"
                      : "text-text-dim hover:text-text-main hover:bg-surface-hover"
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="border-t border-border my-1"></div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-sm text-[13px] text-text-dim hover:text-red-400 hover:bg-surface-hover transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
