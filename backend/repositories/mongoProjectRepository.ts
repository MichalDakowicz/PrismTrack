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
  private readonly dbOrProvider: Db | (() => Promise<Db>);

  constructor(dbOrProvider: Db | (() => Promise<Db>)) {
    this.dbOrProvider = dbOrProvider;
  }

  private async getCollection(): Promise<Collection<ProjectRecord>> {
    const db =
      typeof this.dbOrProvider === "function"
        ? await this.dbOrProvider()
        : this.dbOrProvider;

    return db.collection<ProjectRecord>("projects");
  }

  async ensureIndexes(): Promise<void> {
    const collection = await this.getCollection();

    await collection.createIndexes([
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
    const collection = await this.getCollection();

    return collection
      .find({ workspaceId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async getProjectById(workspaceId: string, projectId: string): Promise<ProjectRecord | null> {
    const collection = await this.getCollection();
    return collection.findOne({ workspaceId, id: projectId });
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

    const collection = await this.getCollection();
    await collection.insertOne(project);
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

    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { workspaceId, id: projectId },
      { $set: updatePayload },
      { returnDocument: "after" }
    );

    return result || null;
  }

  async deleteProject(workspaceId: string, projectId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ workspaceId, id: projectId });
    return result.deletedCount === 1;
  }
}
