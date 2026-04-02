import { Pool } from "pg";
import {
  CreateProjectInput,
  ProjectRecord,
  UpdateProjectInput,
} from "../models/projectPersistence";
import { ProjectRepository } from "./projectRepository";

function nowIso(): string {
  return new Date().toISOString();
}

export class PostgresProjectRepository implements ProjectRepository {
  private readonly poolOrProvider: Pool | (() => Promise<Pool>);

  constructor(poolOrProvider: Pool | (() => Promise<Pool>)) {
    this.poolOrProvider = poolOrProvider;
  }

  private async getPool(): Promise<Pool> {
    if (typeof this.poolOrProvider === "function") {
      return await this.poolOrProvider();
    }
    return this.poolOrProvider;
  }

  async ensureIndexes(): Promise<void> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      // Indexes are created in schema.sql, but we ensure they exist
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_workspace_updated_at
        ON projects (workspace_id, updated_at DESC);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_workspace_linked_repositories
        ON projects (workspace_id);
      `);
    } finally {
      client.release();
    }
  }

  async listProjects(workspaceId: string): Promise<ProjectRecord[]> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      const result = await client.query<any>(
        `
        SELECT 
          id,
          workspace_id as "workspaceId",
          name,
          description,
          status,
          linked_repositories as "linkedRepositories",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM projects
        WHERE workspace_id = $1
        ORDER BY updated_at DESC
        `,
        [workspaceId]
      );

      return result.rows.map(mapRowToProjectRecord);
    } finally {
      client.release();
    }
  }

  async getProjectById(workspaceId: string, projectId: string): Promise<ProjectRecord | null> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      const result = await client.query<any>(
        `
        SELECT 
          id,
          workspace_id as "workspaceId",
          name,
          description,
          status,
          linked_repositories as "linkedRepositories",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM projects
        WHERE id = $1 AND workspace_id = $2
        `,
        [projectId, workspaceId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapRowToProjectRecord(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      const now = nowIso();
      const linkedRepositories = input.linkedRepositories ? JSON.stringify(input.linkedRepositories) : "[]";

      const result = await client.query<any>(
        `
        INSERT INTO projects (workspace_id, name, description, status, linked_repositories, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id,
          workspace_id as "workspaceId",
          name,
          description,
          status,
          linked_repositories as "linkedRepositories",
          created_at as "createdAt",
          updated_at as "updatedAt"
        `,
        [
          input.workspaceId,
          input.name,
          input.description || null,
          input.status || "active",
          linkedRepositories,
          now,
          now,
        ]
      );

      return mapRowToProjectRecord(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updateProject(workspaceId: string, projectId: string, input: UpdateProjectInput): Promise<ProjectRecord | null> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      // Build dynamic update query based on provided fields
      const updates: string[] = [];
      const values: any[] = [projectId, workspaceId];
      let paramIndex = 3;

      if (input.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(input.name);
        paramIndex++;
      }

      if (input.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(input.description || null);
        paramIndex++;
      }

      if (input.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(input.status);
        paramIndex++;
      }

      if (input.linkedRepositories !== undefined) {
        updates.push(`linked_repositories = $${paramIndex}`);
        values.push(JSON.stringify(input.linkedRepositories || []));
        paramIndex++;
      }

      updates.push(`updated_at = $${paramIndex}`);
      values.push(nowIso());

      if (updates.length === 1) {
        // Only updated_at was set
        const result = await client.query<any>(
          `
          UPDATE projects
          SET updated_at = $3
          WHERE id = $1 AND workspace_id = $2
          RETURNING 
            id,
            workspace_id as "workspaceId",
            name,
            description,
            status,
            linked_repositories as "linkedRepositories",
            created_at as "createdAt",
            updated_at as "updatedAt"
          `,
          values
        );

        if (result.rows.length === 0) {
          return null;
        }

        return mapRowToProjectRecord(result.rows[0]);
      }

      const query = `
        UPDATE projects
        SET ${updates.join(", ")}
        WHERE id = $1 AND workspace_id = $2
        RETURNING 
          id,
          workspace_id as "workspaceId",
          name,
          description,
          status,
          linked_repositories as "linkedRepositories",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      const result = await client.query<any>(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return mapRowToProjectRecord(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async deleteProject(workspaceId: string, projectId: string): Promise<boolean> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      const result = await client.query("DELETE FROM projects WHERE id = $1 AND workspace_id = $2", [
        projectId,
        workspaceId,
      ]);

      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  private parseLinkedRepositories(value: any): any[] {
    if (!value) {
      return [];
    }
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  }
}

function mapRowToProjectRecord(row: any): ProjectRecord {
  return {
    id: String(row.id),
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description || undefined,
    status: row.status,
    linkedRepositories: Array.isArray(row.linkedRepositories)
      ? row.linkedRepositories
      : typeof row.linkedRepositories === "string"
        ? JSON.parse(row.linkedRepositories)
        : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
