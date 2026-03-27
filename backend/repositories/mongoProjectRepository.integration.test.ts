import { describe, expect, it } from "vitest";
import { MongoProjectRepository } from "./mongoProjectRepository";

class FakeCollection<T extends { id: string; workspaceId: string; updatedAt: string }> {
  private records: T[] = [];

  async createIndexes() {
    return [];
  }

  async insertOne(doc: T) {
    this.records.push(doc);
    return { acknowledged: true };
  }

  find(query: Partial<T>) {
    const filtered = this.records.filter((item) => {
      if (query.workspaceId && item.workspaceId !== query.workspaceId) {
        return false;
      }
      return true;
    });

    return {
      sort: ({ updatedAt }: { updatedAt: 1 | -1 }) => ({
        toArray: async () =>
          [...filtered].sort((a, b) =>
            updatedAt === -1
              ? b.updatedAt.localeCompare(a.updatedAt)
              : a.updatedAt.localeCompare(b.updatedAt)
          ),
      }),
    };
  }

  async findOne(query: Partial<T>) {
    return this.records.find((item) => item.id === query.id && item.workspaceId === query.workspaceId) || null;
  }

  async findOneAndUpdate(
    query: Partial<T>,
    update: { $set: Partial<T> }
  ) {
    const index = this.records.findIndex(
      (item) => item.id === query.id && item.workspaceId === query.workspaceId
    );
    if (index === -1) {
      return null;
    }

    this.records[index] = {
      ...this.records[index],
      ...update.$set,
    };
    return this.records[index];
  }
}

class FakeDb {
  private readonly collectionImpl = new FakeCollection<any>();

  collection() {
    return this.collectionImpl;
  }
}

describe("mongo project repository integration", () => {
  it("handles create, list and update flows through mongo repository implementation", async () => {
    const repository = new MongoProjectRepository(new FakeDb() as any);

    await repository.ensureIndexes();

    const created = await repository.createProject({
      workspaceId: "workspace-a",
      name: "Delivery",
      linkedRepositories: [{ id: 10, full_name: "acme/api", name: "api" }],
    });

    const listed = await repository.listProjects("workspace-a");
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);

    const updated = await repository.updateProject("workspace-a", created.id, {
      name: "Delivery v2",
    });

    expect(updated?.name).toBe("Delivery v2");
  });
});
