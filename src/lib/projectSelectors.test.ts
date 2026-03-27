import { describe, expect, it } from "vitest";
import { Project } from "../types";
import { filterIssuesByProject, filterPullRequestsByProject, hasLinkedRepositories } from "./projectSelectors";

const project: Project = {
  id: "project-a",
  name: "Project A",
  status: "active",
  linkedRepositories: [
    { id: 1, full_name: "acme/web", name: "web", html_url: "https://github.com/acme/web" },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("projectSelectors", () => {
  it("returns all issues when no project is selected", () => {
    const issues = [
      {
        id: 1,
        number: 101,
        title: "Issue one",
        body: "",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        labels: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        html_url: "https://example.com/1",
        repository_url: "https://api.github.com/repos/acme/web",
      },
      {
        id: 2,
        number: 102,
        title: "Issue two",
        body: "",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        labels: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        html_url: "https://example.com/2",
        repository_url: "https://api.github.com/repos/acme/worker",
      },
    ];

    const filtered = filterIssuesByProject(issues, null);
    expect(filtered).toHaveLength(2);
  });

  it("returns all pull requests when no project is selected", () => {
    const pullRequests = [
      {
        id: 11,
        number: 17,
        title: "UI polish",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        merged_at: null,
        html_url: "https://example.com/pr/17",
        repository_url: "https://api.github.com/repos/acme/web",
      },
      {
        id: 12,
        number: 18,
        title: "Worker pipeline",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        merged_at: null,
        html_url: "https://example.com/pr/18",
        repository_url: "https://api.github.com/repos/acme/worker",
      },
    ];

    const filtered = filterPullRequestsByProject(pullRequests, null);
    expect(filtered).toHaveLength(2);
  });

  it("filters issues by linked repositories", () => {
    const issues = [
      {
        id: 1,
        number: 101,
        title: "In scope",
        body: "",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        labels: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        html_url: "https://example.com/1",
        repository_url: "https://api.github.com/repos/acme/web",
      },
      {
        id: 2,
        number: 102,
        title: "Out of scope",
        body: "",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        labels: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        html_url: "https://example.com/2",
        repository_url: "https://api.github.com/repos/acme/worker",
      },
    ];

    const filtered = filterIssuesByProject(issues, project);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].number).toBe(101);
  });

  it("filters pull requests by linked repositories", () => {
    const pullRequests = [
      {
        id: 11,
        number: 17,
        title: "UI polish",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        merged_at: null,
        html_url: "https://example.com/pr/17",
        repository_url: "https://api.github.com/repos/acme/web",
      },
      {
        id: 12,
        number: 18,
        title: "Worker pipeline",
        state: "open" as const,
        user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
        merged_at: null,
        html_url: "https://example.com/pr/18",
        repository_url: "https://api.github.com/repos/acme/worker",
      },
    ];

    const filtered = filterPullRequestsByProject(pullRequests, project);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].number).toBe(17);
  });

  it("returns false for projects without repository links", () => {
    expect(hasLinkedRepositories(project)).toBe(true);
    expect(hasLinkedRepositories({ ...project, linkedRepositories: [] })).toBe(false);
  });
});
