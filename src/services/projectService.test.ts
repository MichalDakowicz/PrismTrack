import { describe, expect, it } from "vitest";
import { createInMemoryProjectService } from "./projectService";
import { Repository } from "../types";

const repositories: Repository[] = [
  {
    id: 1,
    name: "web",
    full_name: "acme/web",
    owner: { id: 10, login: "acme", avatar_url: "", name: "Acme" },
    private: false,
    html_url: "https://github.com/acme/web",
  },
  {
    id: 2,
    name: "api",
    full_name: "acme/api",
    owner: { id: 10, login: "acme", avatar_url: "", name: "Acme" },
    private: false,
    html_url: "https://github.com/acme/api",
  },
  {
    id: 3,
    name: "worker",
    full_name: "acme/worker",
    owner: { id: 10, login: "acme", avatar_url: "", name: "Acme" },
    private: true,
    html_url: "https://github.com/acme/worker",
  },
];

describe("createInMemoryProjectService", () => {
  it("provides a stable provider contract and lifecycle operations", async () => {
    const service = createInMemoryProjectService(repositories);

    expect(typeof service.listProjects).toBe("function");
    expect(typeof service.createProject).toBe("function");
    expect(typeof service.updateProject).toBe("function");

    const initial = await service.listProjects();
    expect(initial).toHaveLength(0);

    const created = await service.createProject({
      name: "Launch Readiness",
      description: "Release execution",
      repositoryIds: [1, 3],
    });

    expect(created.name).toBe("Launch Readiness");
    expect(created.linkedRepositories.map((repo) => repo.full_name)).toEqual([
      "acme/web",
      "acme/worker",
    ]);

    const updated = await service.updateProject(created.id, {
      name: "Launch Readiness Updated",
      repositoryIds: [2],
      status: "archived",
    });

    expect(updated.name).toBe("Launch Readiness Updated");
    expect(updated.status).toBe("archived");
    expect(updated.linkedRepositories.map((repo) => repo.full_name)).toEqual(["acme/api"]);
  });
});
