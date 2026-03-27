import { Collection, Db } from "mongodb";
import {
  CreateProjectInput,
  ProjectRecord,
  UpdateProjectInput,
} from "../models/projectPersistence";
import { ProjectRepository } from "./projectRepository";

function nowIso(): string {
  return new Date().toISOString();
}

export class MongoProjectRepository implements ProjectRepository {
  private readonly collection: Collection<ProjectRecord>;

  constructor(db: Db) {
    this.collection = db.collection<ProjectRecord>("projects");
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndexes([
      { key: { workspaceId: 1, updatedAt: -1 }, name: "workspace_updatedAt" },
      {
        key: {
          workspaceId: 1,
          "linkedRepositories.full_name": 1,
        },
        name: "workspace_linkedRepositories_full_name",
      },
    ]);
  }

  async listProjects(workspaceId: string): Promise<ProjectRecord[]> {
    return this.collection
      .find({ workspaceId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async getProjectById(workspaceId: string, projectId: string): Promise<ProjectRecord | null> {
    return this.collection.findOne({ workspaceId, id: projectId });
  }

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const project: ProjectRecord = {
      id: `project-${Math.random().toString(36).slice(2, 10)}`,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      status: input.status || "active",
      linkedRepositories: input.linkedRepositories || [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    await this.collection.insertOne(project);
    return project;
  }

  async updateProject(
    workspaceId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<ProjectRecord | null> {
    const updatePayload: Partial<ProjectRecord> = {
      updatedAt: nowIso(),
    };

    if (input.name !== undefined) {
      updatePayload.name = input.name;
    }
    if (input.description !== undefined) {
      updatePayload.description = input.description;
    }
    if (input.status !== undefined) {
      updatePayload.status = input.status;
    }
    if (input.linkedRepositories !== undefined) {
      updatePayload.linkedRepositories = input.linkedRepositories;
    }

    const result = await this.collection.findOneAndUpdate(
      { workspaceId, id: projectId },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    return result || null;
  }

  async deleteProject(workspaceId: string, projectId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ workspaceId, id: projectId });
    return result.deletedCount === 1;
  }
}
