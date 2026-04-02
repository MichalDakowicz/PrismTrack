import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createPostgresConnectionManager } from "./postgresConnection";
import { Pool, PoolClient } from "pg";

describe("PostgresConnectionManager", () => {
  let mockPool: Partial<Pool>;
  let mockClient: Partial<PoolClient>;

  beforeEach(() => {
    mockClient = {
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn().mockResolvedValue(undefined),
    };

    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      end: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("connect", () => {
    it("should create a pool and return a connected client", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      const client = await manager.connect();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith("SELECT 1");
      expect(client).toBe(mockClient);
    });

    it("should guard concurrent connect calls with a shared promise", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      const promise1 = manager.connect();
      const promise2 = manager.connect();

      await Promise.all([promise1, promise2]);

      // createPool should be called only once despite concurrent calls
      expect(mockPool.connect).toHaveBeenCalled();
    });

    it("should reuse pool if already connected and healthy", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();
      const callCountAfterFirstConnect = (mockPool.connect as any).mock.calls.length;

      await manager.connect();
      const callCountAfterSecondConnect = (mockPool.connect as any).mock.calls.length;

      expect(callCountAfterSecondConnect).toBeGreaterThan(callCountAfterFirstConnect);
    });

    it("should reconnect if connection is stale", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();

      // Simulate connection stale by making query fail
      (mockClient.query as any).mockRejectedValueOnce(new Error("Connection lost"));

      await manager.connect();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  describe("getPool", () => {
    it("should return the pool if connected", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();
      const pool = manager.getPool();

      expect(pool).toBe(mockPool);
    });

    it("should throw if pool is not initialized", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      expect(() => manager.getPool()).toThrow("PostgreSQL pool is not initialized");
    });
  });

  describe("ping", () => {
    it("should return true if connection is healthy", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();
      const result = await manager.ping();

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("should return false if not connected", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      const result = await manager.ping();

      expect(result).toBe(false);
    });

    it("should return false if pool query fails", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();

      (mockClient.query as any).mockRejectedValueOnce(new Error("Connection failed"));

      const result = await manager.ping();

      expect(result).toBe(false);
    });
  });

  describe("close", () => {
    it("should end the pool", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();
      await manager.close();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  describe("isConnected", () => {
    it("should return false before connecting", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      expect(manager.isConnected()).toBe(false);
    });

    it("should return true after connecting", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();

      expect(manager.isConnected()).toBe(true);
    });

    it("should return false after closing", async () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "user",
        password: "pass",
      };

      const manager = createPostgresConnectionManager(config, {
        createPool: () => mockPool as Pool,
      });

      await manager.connect();
      await manager.close();

      expect(manager.isConnected()).toBe(false);
    });
  });
});
