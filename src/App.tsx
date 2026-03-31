import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./views/Dashboard";
import { IssuesList } from "./views/IssuesList";
import { Board } from "./views/Board";
import { PullRequests } from "./views/PullRequests";
import { Landing } from "./views/Landing";
import { CommandPalette } from "./components/CommandPalette";
import { Projects } from "./views/Projects";
import { ProjectDetail } from "./views/ProjectDetail";
import { Branches } from "./views/Branches";
import { WorkspaceSectionPlaceholder } from "./views/WorkspaceSectionPlaceholder";
import { Repositories } from "./views/Repositories";
import { WorkspaceSettings } from "./views/WorkspaceSettings";
import { GitHubAppSettings } from "./views/GitHubAppSettings";
import { MembersSettings } from "./views/MembersSettings";
import { NotificationsSettings } from "./views/NotificationsSettings";
import { IssueDetailPanel } from "./components/IssueDetailPanel/index";
import { SidebarProvider } from "./contexts/SidebarContext";

export default function App() {
  const { user, loading } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <SidebarProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-issues" element={<IssuesList />} />
          <Route path="/issues" element={<IssuesList />} />
          <Route path="/board" element={<Board />} />
          <Route path="/pull-requests" element={<PullRequests />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route
            path="/settings/workspace"
            element={<WorkspaceSettings />}
          />
          <Route
            path="/settings/github-app"
            element={<GitHubAppSettings installed={true} />}
          />
          <Route
            path="/settings/members"
            element={<MembersSettings />}
          />
          <Route
            path="/settings/notifications"
            element={<NotificationsSettings />}
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<Navigate to="board" replace />} />
          <Route path="/projects/:projectId/:view" element={<ProjectDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <IssueDetailPanel />
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </SidebarProvider>
  );
}
