import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { ProjectProvider } from "../contexts/ProjectContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, login: "octo", avatar_url: "https://example.com/avatar.png", name: "Octo" },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("project scoped integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates from Projects and keeps active project scope across project tabs", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/github/repos")) {
        return {
          ok: true,
          json: async () => [
            { id: 1, name: "web", full_name: "acme/web", private: false, html_url: "https://github.com/acme/web", owner: { id: 1, login: "acme", avatar_url: "", name: "Acme" } },
            { id: 2, name: "api", full_name: "acme/api", private: false, html_url: "https://github.com/acme/api", owner: { id: 1, login: "acme", avatar_url: "", name: "Acme" } },
            { id: 3, name: "worker", full_name: "acme/worker", private: false, html_url: "https://github.com/acme/worker", owner: { id: 1, login: "acme", avatar_url: "", name: "Acme" } },
          ],
        } as Response;
      }

      if (url.includes("/api/projects")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "project-core-platform",
              name: "Core Platform",
              description: "Platform work",
              status: "active",
              linkedRepositories: [
                { id: 1, full_name: "acme/web", name: "web" },
              ],
              createdAt: "2024-01-01",
              updatedAt: "2024-01-01",
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/issues")) {
        return {
          ok: true,
          json: async () => [
            {
              id: 11,
              number: 101,
              title: "In project",
              body: "",
              state: "open",
              user: { id: 1, login: "octo", avatar_url: "https://example.com/u1.png", name: "Octo" },
              labels: [],
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
              html_url: "https://example.com/issues/101",
              repository_url: "https://api.github.com/repos/acme/web",
            },
            {
              id: 12,
              number: 102,
              title: "Out of project",
              body: "",
              state: "open",
              user: { id: 1, login: "octo", avatar_url: "https://example.com/u2.png", name: "Octo" },
              labels: [],
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
              html_url: "https://example.com/issues/102",
              repository_url: "https://api.github.com/repos/acme/legacy",
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/pulls") || url.includes("/api/github/issues?q=") || url.includes("/api/github/pulls?q=")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Projects", level: 1 })).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: /Open Core Platform/i }));

    expect(await screen.findByRole("heading", { name: "Core Platform", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("link", { name: /List/i })[0]);

    expect(await screen.findByRole("heading", { name: "Issues" })).toBeInTheDocument();
    expect(screen.getByText("1 Open")).toBeInTheDocument();
  });

  it("shows deterministic empty state when a project has zero linked repositories", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/github/repos")) {
        return { ok: true, json: async () => [] } as Response;
      }

      if (url.includes("/api/projects")) {
        return {
          ok: true,
          json: async () => [
            {
              id: "project-core-platform",
              name: "Core Platform",
              description: "Platform work",
              status: "active",
              linkedRepositories: [],
              createdAt: "2024-01-01",
              updatedAt: "2024-01-01",
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/issues") || url.includes("/api/github/pulls")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(
      <MemoryRouter initialEntries={["/projects/project-core-platform/board"]}>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No linked repositories/i)).toBeInTheDocument();
    });
  });
});
