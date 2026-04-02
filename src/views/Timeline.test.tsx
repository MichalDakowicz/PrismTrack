import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Timeline } from "./Timeline";

vi.mock("../contexts/ProjectContext", () => ({
  useProjects: () => ({
    activeProject: {
      id: "project-a",
      name: "Project A",
      status: "active",
      linkedRepositories: [{ id: 1, full_name: "acme/web", name: "web" }],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  }),
}));

vi.mock("../contexts/SidebarContext", () => ({
  useSidebar: () => ({
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    isOpen: false,
    selectedIssue: null,
  }),
}));

describe("Timeline", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading then renders timeline items", async () => {
    const now = new Date().toISOString();

    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/github/issues")) {
        return {
          ok: true,
          json: async () => [
            {
              id: 1,
              number: 101,
              title: "Timeline issue",
              body: "",
              state: "open",
              user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
              labels: [],
              assignees: [],
              created_at: now,
              updated_at: now,
              html_url: "https://example.com/issues/101",
              repository_url: "https://api.github.com/repos/acme/web",
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/pulls")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(<Timeline />);

    expect(screen.getByRole("status", { name: "Loading timeline" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Timeline" })).toBeInTheDocument();
    expect(screen.getByText(/Timeline issue/i)).toBeInTheDocument();
  });

  it("shows error state and retries successfully", async () => {
    let attempt = 0;
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      attempt += 1;

      if (attempt <= 2) {
        return { ok: false, json: async () => ({}) } as Response;
      }

      if (url.includes("/api/github/issues")) {
        return { ok: true, json: async () => [] } as Response;
      }

      if (url.includes("/api/github/pulls")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(<Timeline />);

    expect(await screen.findByText(/Failed to load timeline/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Timeline" })).toBeInTheDocument();
    });
  });

  it("supports granularity and empty-state interactions", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/github/issues")) {
        return {
          ok: true,
          json: async () => [
            {
              id: 1,
              number: 101,
              title: "Old issue",
              body: "",
              state: "open",
              user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
              labels: [],
              assignees: [],
              created_at: "2022-01-01T08:00:00.000Z",
              updated_at: "2022-01-01T08:00:00.000Z",
              html_url: "https://example.com/issues/101",
              repository_url: "https://api.github.com/repos/acme/web",
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/pulls")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(<Timeline />);

    expect(await screen.findByRole("heading", { name: "Timeline" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Timeline granularity"), {
      target: { value: "month" },
    });
    expect(screen.getByLabelText("Timeline granularity")).toHaveValue("month");

    expect(screen.getByText(/No timeline items in range/i)).toBeInTheDocument();
  });
});
