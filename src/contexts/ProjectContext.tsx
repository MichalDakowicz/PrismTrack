import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Project, Repository } from "../types";
import {
  createApiProjectService,
  createInMemoryProjectService,
  type ProjectCreateInput,
  type ProjectService,
  type ProjectUpdateInput,
} from "../services/projectService";
import { useAuth } from "./AuthContext";

interface ProjectContextValue {
  projects: Project[];
  repositories: Repository[];
  activeProjectId: string | null;
  activeProject: Project | null;
  loading: boolean;
  createProject: (input: ProjectCreateInput) => Promise<Project>;
  updateProject: (projectId: string, input: ProjectUpdateInput) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const STORAGE_KEY = "prismtrack_active_project";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [service, setService] = useState<ProjectService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) {
        setProjects([]);
        setRepositories([]);
        setActiveProjectId(null);
        setService(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const repoResponse = await fetch("/api/github/repos");
        const repoData = repoResponse.ok ? await repoResponse.json() : [];
        const repos = Array.isArray(repoData) ? (repoData as Repository[]) : [];
        setRepositories(repos);

        const fallbackService = createInMemoryProjectService(repos);
        let projectService: ProjectService = fallbackService;

        try {
          const apiService = createApiProjectService(repos);
          await apiService.listProjects();
          projectService = apiService;
        } catch {
          projectService = fallbackService;
        }

        const initialProjects = await projectService.listProjects();
        setService(projectService);
        setProjects(initialProjects);
        setActiveProjectId((current) => {
          if (!current) {
            return null;
          }

          const stillExists = initialProjects.some((project) => project.id === current);
          return stillExists ? current : null;
        });
      } catch (error) {
        console.error("Failed to initialize projects:", error);
        setRepositories([]);
        setProjects([]);
        setService(createInMemoryProjectService([]));
        setActiveProjectId(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [user?.id]);

  const createProject = useCallback(async (input: ProjectCreateInput) => {
    if (!service) {
      throw new Error("Project service unavailable");
    }

    const project = await service.createProject(input);
    setProjects((current) => [project, ...current]);
    setActiveProjectId(project.id);
    return project;
  }, [service]);

  const updateProject = useCallback(async (projectId: string, input: ProjectUpdateInput) => {
    if (!service) {
      throw new Error("Project service unavailable");
    }

    const project = await service.updateProject(projectId, input);
    setProjects((current) => current.map((item) => (item.id === project.id ? project : item)));
    return project;
  }, [service]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!service) {
      throw new Error("Project service unavailable");
    }

    await service.deleteProject(projectId);
    setProjects((current) => {
      const next = current.filter((item) => item.id !== projectId);
      setActiveProjectId((active) => {
        if (active !== projectId) {
          return active;
        }
        return null;
      });
      return next;
    });
  }, [service]);

  const selectProject = useCallback((projectId: string | null) => {
    setActiveProjectId(projectId);
    if (projectId) {
      localStorage.setItem(STORAGE_KEY, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        repositories,
        activeProjectId,
        activeProject,
        loading,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }

  return context;
}
