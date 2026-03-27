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
import { WorkspaceSectionPlaceholder } from "./views/WorkspaceSectionPlaceholder";

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
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-issues" element={<IssuesList />} />
          <Route path="/issues" element={<IssuesList />} />
          <Route path="/board" element={<Board />} />
          <Route path="/pull-requests" element={<PullRequests />} />
          <Route
            path="/branches"
            element={<WorkspaceSectionPlaceholder title="Branches" description="Branch tracking and stale branch indicators will appear here." />}
          />
          <Route
            path="/repositories"
            element={<WorkspaceSectionPlaceholder title="Repositories" description="Workspace repository management and linking controls will appear here." />}
          />
          <Route
            path="/settings/workspace"
            element={<WorkspaceSectionPlaceholder title="Workspace Settings" description="Workspace identity, slug, and avatar controls will appear here." />}
          />
          <Route
            path="/settings/github-app"
            element={<WorkspaceSectionPlaceholder title="GitHub App" description="Installation status and repository permissions will appear here." />}
          />
          <Route
            path="/settings/members"
            element={<WorkspaceSectionPlaceholder title="Members" description="Member roles, invitations, and access management will appear here." />}
          />
          <Route
            path="/settings/notifications"
            element={<WorkspaceSectionPlaceholder title="Notifications" description="Notification channels and user notification preferences will appear here." />}
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<Navigate to="board" replace />} />
          <Route path="/projects/:projectId/:view" element={<ProjectDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
}
