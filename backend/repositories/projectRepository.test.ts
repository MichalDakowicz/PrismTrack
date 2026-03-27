import { describe, expect, it } from "vitest";
import { InMemoryProjectRepository } from "./inMemoryProjectRepository";
import { validateProjectInput } from "./projectRepository";

describe("project repository contract", () => {
  it("supports create, list, get, and update operations", async () => {
    const repository = new InMemoryProjectRepository();
    const workspaceId = "workspace-demo";

    const created = await repository.createProject({
      workspaceId,
      name: "Core Platform",
      linkedRepositories: [{ id: 1, full_name: "acme/web", name: "web" }],
    });

    expect(created.id).toContain("project-");

    const listed = await repository.listProjects(workspaceId);
    expect(listed).toHaveLength(1);

    const fetched = await repository.getProjectById(workspaceId, created.id);
    expect(fetched?.name).toBe("Core Platform");

    const updated = await repository.updateProject(workspaceId, created.id, {
      name: "Core Platform Updated",
      status: "archived",
    });

    expect(updated?.name).toBe("Core Platform Updated");
    expect(updated?.status).toBe("archived");
  });

  it("validates project input and linked repository records", () => {
    const errors = validateProjectInput({
      name: "",
      status: "invalid",
      linkedRepositories: [{ id: 1, full_name: "", name: "" }],
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});
