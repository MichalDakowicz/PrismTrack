import { describe, expect, it } from "vitest";
import { createMongoConnectionManager } from "./mongoConnection";
import { DatabaseConfig } from "../config/database";

class FakeDb {
  async command(value: object) {
    if ((value as any).ping === 1) {
      return { ok: 1 };
    }
    return { ok: 0 };
  }
}

class FakeClient {
  public connected = false;
  public closed = false;
  private readonly fakeDb = new FakeDb();

  async connect() {
    this.connected = true;
  }

  db() {
    return this.fakeDb;
  }

  async close() {
    this.closed = true;
    this.connected = false;
  }
}

describe("mongo connection manager", () => {
  it("connects once, pings, and closes cleanly", async () => {
    const fakeClient = new FakeClient();
    const config: DatabaseConfig = {
      uri: "mongodb://localhost:27017",
      dbName: "prismtrack",
      connectTimeoutMS: 1000,
      socketTimeoutMS: 1000,
      serverSelectionTimeoutMS: 1000,
      useInMemoryProjectRepo: false,
      allowInMemoryProjectRepoFallback: false,
    };

    const manager = createMongoConnectionManager(config, {
      createClient: () => fakeClient as any,
    });

    const dbOne = await manager.connect();
    const dbTwo = await manager.connect();

    expect(dbOne).toBe(dbTwo);
    expect(manager.isConnected()).toBe(true);
    expect(await manager.ping()).toBe(true);

    await manager.close();
    expect(fakeClient.closed).toBe(true);
    expect(manager.isConnected()).toBe(false);
  });
});
