import { describe, expect, it } from "vitest";
import { Project } from "../types";
import {
  applyTimelineFilters,
  normalizeTimelineItems,
} from "./timelineSelectors";

const project: Project = {
  id: "project-a",
  name: "Project A",
  status: "active",
  linkedRepositories: [{ id: 1, full_name: "acme/web", name: "web" }],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("timelineSelectors", () => {
  it("normalizes scoped issues and pull requests into one timeline stream", () => {
    const items = normalizeTimelineItems(
      [
        {
          id: 1,
          number: 101,
          title: "Scoped issue",
          body: "",
          state: "open",
          user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
          labels: [],
          assignees: [{ id: 2, login: "alice", avatar_url: "", name: "Alice" }],
          created_at: "2024-01-10T08:00:00.000Z",
          updated_at: "2024-01-15T09:00:00.000Z",
          html_url: "https://example.com/issues/101",
          repository_url: "https://api.github.com/repos/acme/web",
        },
      ],
      [
        {
          id: 3,
          number: 25,
          title: "Scoped PR",
          state: "closed",
          user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
          created_at: "2024-01-12T08:00:00.000Z",
          updated_at: "2024-01-16T10:00:00.000Z",
          merged_at: "2024-01-16T10:00:00.000Z",
          html_url: "https://example.com/pulls/25",
          repository_url: "https://api.github.com/repos/acme/web",
        },
      ],
      project,
    );

    expect(items).toHaveLength(2);
    expect(items[0].type).toBe("issue");
    expect(items[0].assignees).toEqual(["alice"]);
    expect(items[1].type).toBe("pull-request");
    expect(items[1].state).toBe("merged");
  });

  it("applies state, assignee, repository, and date range filters", () => {
    const items = normalizeTimelineItems(
      [
        {
          id: 1,
          number: 11,
          title: "Issue one",
          body: "",
          state: "open",
          user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
          labels: [],
          assignees: [{ id: 2, login: "alice", avatar_url: "", name: "Alice" }],
          created_at: "2024-02-10T08:00:00.000Z",
          updated_at: "2024-02-10T08:00:00.000Z",
          html_url: "https://example.com/issues/11",
          repository_url: "https://api.github.com/repos/acme/web",
        },
        {
          id: 2,
          number: 12,
          title: "Issue two",
          body: "",
          state: "closed",
          user: { id: 1, login: "octo", avatar_url: "", name: "Octo" },
          labels: [],
          assignees: [{ id: 3, login: "bob", avatar_url: "", name: "Bob" }],
          created_at: "2024-02-12T08:00:00.000Z",
          updated_at: "2024-02-12T08:00:00.000Z",
          html_url: "https://example.com/issues/12",
          repository_url: "https://api.github.com/repos/acme/web",
        },
      ],
      [],
      project,
    );

    const filtered = applyTimelineFilters(
      items,
      { state: "open", assignee: "ali", repository: "acme/web" },
      new Date("2024-02-09T00:00:00.000Z"),
      new Date("2024-02-11T23:59:59.999Z"),
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].number).toBe(11);
  });

  it("includes items whose roadmap span overlaps the selected range", () => {
    const items = [
      {
        id: "issue-1",
        type: "issue" as const,
        number: 1,
        title: "Long running item",
        state: "open" as const,
        userLogin: "octo",
        assignees: ["alice"],
        repositoryFullName: "acme/web",
        startAt: "2024-01-01T00:00:00.000Z",
        endAt: "2024-02-20T00:00:00.000Z",
        htmlUrl: "https://example.com/issues/1",
      },
    ];

    const filtered = applyTimelineFilters(
      items,
      { state: "all", assignee: "", repository: "" },
      new Date("2024-02-01T00:00:00.000Z"),
      new Date("2024-02-10T23:59:59.999Z"),
    );

    expect(filtered).toHaveLength(1);
  });
});
