import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Branches } from "./Branches";

const mockedActiveProject = {
  id: "project-core-platform",
  name: "Core Platform",
  linkedRepositories: [
    { id: 1, name: "web", full_name: "acme/web" },
    { id: 2, name: "api", full_name: "acme/api" },
  ],
};

vi.mock("../contexts/ProjectContext", () => ({
  useProjects: () => ({
    activeProject: mockedActiveProject,
  }),
}));

const baseDate = "2026-03-15T12:00:00.000Z";

function mockBranchesFetch() {
  vi.spyOn(global, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/api/github/branch-commits?repo=acme%2Fweb&branch=feature%2Fauth")) {
      return {
        ok: true,
        json: async () => [
          {
            sha: "1234567890abcdef",
            message: "Add login validation",
            url: "https://github.com/acme/web/commit/1234567",
            authorLogin: "michal",
            authorAvatarUrl: "",
            committedAt: baseDate,
          },
        ],
      } as Response;
    }

    if (url.includes("/api/github/branch-commits?repo=acme%2Fapi&branch=fix%2Fcache")) {
      return {
        ok: true,
        json: async () => [
          {
            sha: "abcdef1234567890",
            message: "Fix cache invalidation",
            url: "https://github.com/acme/api/commit/abcdef1",
            authorLogin: "alex",
            authorAvatarUrl: "",
            committedAt: baseDate,
          },
        ],
      } as Response;
    }

    if (url.includes("/api/github/branches?repo=acme%2Fweb")) {
      return {
        ok: true,
        json: async () => [
          {
            name: "feature/auth",
            commit: { sha: "abc", url: "https://example.com/abc" },
            protected: true,
            lastCommitDate: baseDate,
            author: { login: "michal", avatar_url: "" },
            pullRequest: { number: 12, state: "open", url: "https://github.com/acme/web/pull/12" },
            repository: { full_name: "acme/web", name: "web" },
          },
        ],
      } as Response;
    }

    if (url.includes("/api/github/branches?repo=acme%2Fapi")) {
      return {
        ok: true,
        json: async () => [
          {
            name: "fix/cache",
            commit: { sha: "def", url: "https://example.com/def" },
            protected: false,
            lastCommitDate: baseDate,
            author: { login: "alex", avatar_url: "" },
            repository: { full_name: "acme/api", name: "api" },
          },
        ],
      } as Response;
    }

    return { ok: true, json: async () => [] } as Response;
  });
}

describe("Branches detail sidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("opens the sidebar when selecting a branch", async () => {
    mockBranchesFetch();

    render(<Branches />);

    await waitFor(() => {
      expect(screen.getByText("feature/auth")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("feature/auth"));

    const sidebar = screen.getByLabelText("Branch details");
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getByText("acme/web")).toBeInTheDocument();
    expect(within(sidebar).getByText("Protected")).toBeInTheDocument();
    expect(await within(sidebar).findByText("Add login validation")).toBeInTheDocument();
    expect(screen.queryByLabelText("Close branch details")).not.toBeInTheDocument();
  });

  it("updates detail content when selecting a different branch", async () => {
    mockBranchesFetch();

    render(<Branches />);

    await waitFor(() => {
      expect(screen.getByText("feature/auth")).toBeInTheDocument();
      expect(screen.getByText("fix/cache")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("feature/auth"));
    expect(within(screen.getByLabelText("Branch details")).getByText("web/")).toBeInTheDocument();

    fireEvent.click(screen.getByText("fix/cache"));

    await waitFor(() => {
      const sidebar = screen.getByLabelText("Branch details");
      expect(within(sidebar).getByText("api/")).toBeInTheDocument();
      expect(within(sidebar).getByText("Unprotected")).toBeInTheDocument();
      expect(within(sidebar).getByText("Fix cache invalidation")).toBeInTheDocument();
    });
  });

});
