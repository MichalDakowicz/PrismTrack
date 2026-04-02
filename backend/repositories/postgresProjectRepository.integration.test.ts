import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Pool } from "pg";
import { PostgresProjectRepository } from "./postgresProjectRepository";
import { ProjectRecord } from "../models/projectPersistence";

// Note: These tests assume a test PostgreSQL database is available
// For CI/CD, use containerized PostgreSQL or a test database service

describe("PostgresProjectRepository Integration Tests", () => {
  let pool: Pool;
  let repository: PostgresProjectRepository;
  const testWorkspaceId = "test-workspace-1";

  beforeAll(async () => {
    // Create a test pool connected to a test database
    pool = new Pool({
      host: process.env.TEST_DB_HOST || "localhost",
      port: parseInt(process.env.TEST_DB_PORT || "5432"),
      database: process.env.TEST_DB_NAME || "prismtrack_test",
      user: process.env.TEST_DB_USER || "prismtrack_user",
      password: process.env.TEST_DB_PASSWORD || "",
    });

    repository = new PostgresProjectRepository(pool);

    // Initialize schema
    const client = await pool.connect();
    try {
      // Drop table if it exists (for clean test state)
      await client.query("DROP TABLE IF EXISTS projects CASCADE");

      // Create fresh projects table
      await client.query(`
        CREATE TABLE projects (
          id SERIAL PRIMARY KEY,
          workspace_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'archived')),
          linked_repositories JSONB DEFAULT '[]'::JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_workspace_updated_at
          ON projects (workspace_id, updated_at DESC);
      `);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clear the projects table before each test
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM projects");
    } finally {
      client.release();
    }
  });

  describe("listProjects", () => {
    it("should return empty array when no projects exist", async () => {
      const projects = await repository.listProjects(testWorkspaceId);
      expect(projects).toEqual([]);
    });

    it("should return projects sorted by updated_at descending", async () => {
      // Create projects with different timestamps
      const project1 = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project 1",
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const project2 = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project 2",
      });

      const projects = await repository.listProjects(testWorkspaceId);

      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe(project2.id);
      expect(projects[1].id).toBe(project1.id);
    });

    it("should only return projects for the specified workspace", async () => {
      await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Test Project 1",
      });

      await repository.createProject({
        workspaceId: "other-workspace",
        name: "Other Project",
      });

      const projects = await repository.listProjects(testWorkspaceId);
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("Test Project 1");
    });
  });

  describe("getProjectById", () => {
    it("should return null for non-existent project", async () => {
      const project = await repository.getProjectById(testWorkspaceId, "999999");
      expect(project).toBeNull();
    });

    it("should retrieve a project by id", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Test Project",
        description: "A test project",
        status: "active",
      });

      const retrieved = await repository.getProjectById(testWorkspaceId, created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("Test Project");
      expect(retrieved!.description).toBe("A test project");
    });
  });

  describe("createProject", () => {
    it("should create a project with all fields", async () => {
      const input = {
        workspaceId: testWorkspaceId,
        name: "New Project",
        description: "A new project",
        status: "active" as const,
        linkedRepositories: [{ id: 1, full_name: "user/repo", name: "repo" }],
      };

      const project = await repository.createProject(input);

      expect(project.id).toBeDefined();
      expect(project.name).toBe(input.name);
      expect(project.description).toBe(input.description);
      expect(project.status).toBe(input.status);
      expect(project.linkedRepositories).toEqual(input.linkedRepositories);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it("should set default status to active", async () => {
      const project = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Default Status Project",
      });

      expect(project.status).toBe("active");
    });

    it("should allow null description", async () => {
      const project = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "No Description",
      });

      expect(project.description).toBeUndefined();
    });
  });

  describe("updateProject", () => {
    it("should update project name", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Original Name",
      });

      const updated = await repository.updateProject(testWorkspaceId, created.id, {
        name: "Updated Name",
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("Updated Name");
    });

    it("should update project status", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project",
        status: "active",
      });

      const updated = await repository.updateProject(testWorkspaceId, created.id, {
        status: "archived",
      });

      expect(updated!.status).toBe("archived");
    });

    it("should update linked repositories", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project",
      });

      const newRepos = [
        { id: 1, full_name: "user/repo1", name: "repo1" },
        { id: 2, full_name: "user/repo2", name: "repo2" },
      ];

      const updated = await repository.updateProject(testWorkspaceId, created.id, {
        linkedRepositories: newRepos,
      });

      expect(updated!.linkedRepositories).toEqual(newRepos);
    });

    it("should update updatedAt timestamp", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project",
      });

      const originalUpdatedAt = created.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.updateProject(testWorkspaceId, created.id, {
        name: "New Name",
      });

      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it("should return null for non-existent project", async () => {
      const updated = await repository.updateProject(testWorkspaceId, "999999", {
        name: "New Name",
      });

      expect(updated).toBeNull();
    });

    it("should handle partial updates", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Original",
        description: "Original Description",
        status: "active",
      });

      // Only update name
      const updated = await repository.updateProject(testWorkspaceId, created.id, {
        name: "Updated",
      });

      expect(updated!.name).toBe("Updated");
      expect(updated!.description).toBe("Original Description");
      expect(updated!.status).toBe("active");
    });
  });

  describe("deleteProject", () => {
    it("should delete a project", async () => {
      const created = await repository.createProject({
        workspaceId: testWorkspaceId,
        name: "Project to Delete",
      });

      const deleted = await repository.deleteProject(testWorkspaceId, created.id);

      expect(deleted).toBe(true);

      const retrieved = await repository.getProjectById(testWorkspaceId, created.id);
      expect(retrieved).toBeNull();
    });

    it("should return false for non-existent project", async () => {
      const deleted = await repository.deleteProject(testWorkspaceId, "999999");

      expect(deleted).toBe(false);
    });
  });

  describe("ensureIndexes", () => {
    it("should create indexes without error", async () => {
      await expect(repository.ensureIndexes()).resolves.not.toThrow();
    });
  });
});
