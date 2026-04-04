import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityFeed } from "./ActivityFeed";

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

describe("ActivityFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders activity events and supports filtering", async () => {
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
              title: "Issue A",
              body: "",
              state: "open",
              user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
              labels: [],
              assignees: [],
              created_at: now,
              updated_at: now,
              html_url: "https://example.com/issues/101",
              repository: { id: 1, full_name: "acme/web", name: "web", private: false, html_url: "", owner: { id: 1, login: "acme", avatar_url: "", name: "Acme" } },
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/pulls")) {
        return {
          ok: true,
          json: async () => [
            {
              id: 10,
              number: 33,
              title: "PR A",
              state: "open",
              user: { id: 2, login: "dev", avatar_url: "", name: "Dev" },
              created_at: now,
              updated_at: now,
              closed_at: null,
              merged_at: null,
              html_url: "https://example.com/pr/33",
              repository: { id: 1, full_name: "acme/web", name: "web", private: false, html_url: "", owner: { id: 1, login: "acme", avatar_url: "", name: "Acme" } },
            },
          ],
        } as Response;
      }

      if (url.includes("/api/github/branches")) {
        return {
          ok: true,
          json: async () => [
            {
              name: "feat/a",
              lastCommitDate: now,
              author: { login: "brancher", avatar_url: "" },
              repository: { full_name: "acme/web", name: "web" },
            },
          ],
        } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    render(<ActivityFeed />);

    expect(await screen.findByRole("heading", { name: "Activity Feed" })).toBeInTheDocument();
    expect(screen.getByText(/Issue A/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Event type filter"), {
      target: { value: "pr_opened" },
    });

    expect(screen.getByText(/PR A/i)).toBeInTheDocument();
  });
});
