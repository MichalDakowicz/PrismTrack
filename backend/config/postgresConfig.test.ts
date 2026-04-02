import { describe, it, expect } from "vitest";
import { getPostgresConfig, validatePostgresConfig, assertPostgresConfig } from "./postgresConfig";

describe("PostgreSQL Configuration", () => {
  describe("getPostgresConfig", () => {
    it("should parse configuration from environment variables", () => {
      const env = {
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_NAME: "testdb",
        DB_USER: "testuser",
        DB_PASSWORD: "testpass",
      };

      const config = getPostgresConfig(env);

      expect(config.host).toBe("localhost");
      expect(config.port).toBe(5432);
      expect(config.database).toBe("testdb");
      expect(config.user).toBe("testuser");
      expect(config.password).toBe("testpass");
    });

    it("should apply default values for missing variables", () => {
      const env = {};

      const config = getPostgresConfig(env);

      expect(config.host).toBe("");
      expect(config.port).toBe(5432);
      expect(config.database).toBe("prismtrack");
      expect(config.user).toBe("");
      expect(config.password).toBe("");
      expect(config.max).toBe(10);
      expect(config.idleTimeoutMillis).toBe(30000);
      expect(config.connectionTimeoutMillis).toBe(2000);
    });

    it("should parse boolean flags correctly", () => {
      const env = {
        USE_IN_MEMORY_PROJECT_REPO: "true",
        ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK: "false",
        NODE_ENV: "development",
      };

      const config = getPostgresConfig(env);

      expect(config.useInMemoryProjectRepo).toBe(true);
      expect(config.allowInMemoryProjectRepoFallback).toBe(false);
    });

    it("should allow in-memory fallback in development by default", () => {
      const env = {
        NODE_ENV: "development",
      };

      const config = getPostgresConfig(env);

      expect(config.allowInMemoryProjectRepoFallback).toBe(true);
    });

    it("should disallow in-memory fallback in production by default", () => {
      const env = {
        NODE_ENV: "production",
      };

      const config = getPostgresConfig(env);

      expect(config.allowInMemoryProjectRepoFallback).toBe(false);
    });

    it("should parse custom pool timeout values", () => {
      const env = {
        DB_POOL_MAX: "20",
        DB_IDLE_TIMEOUT_MS: "60000",
        DB_CONNECTION_TIMEOUT_MS: "5000",
      };

      const config = getPostgresConfig(env);

      expect(config.max).toBe(20);
      expect(config.idleTimeoutMillis).toBe(60000);
      expect(config.connectionTimeoutMillis).toBe(5000);
    });
  });

  describe("validatePostgresConfig", () => {
    it("should accept valid configuration", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors).toHaveLength(0);
    });

    it("should require DB_HOST when not using in-memory", () => {
      const config = {
        host: "",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors).toContain("DB_HOST is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
    });

    it("should require DB_USER when not using in-memory", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "testdb",
        user: "",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors).toContain("DB_USER is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
    });

    it("should require DB_NAME when not using in-memory", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors).toContain("DB_NAME is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
    });

    it("should allow empty host/user/DB_NAME when using in-memory", () => {
      const config = {
        host: "",
        port: 5432,
        database: "",
        user: "",
        password: "",
        useInMemoryProjectRepo: true,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors.filter((e) => e.includes("DB_HOST") || e.includes("DB_USER") || e.includes("DB_NAME"))).toHaveLength(0);
    });

    it("should validate port number range", () => {
      const config = {
        host: "localhost",
        port: 99999,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      const errors = validatePostgresConfig(config);

      expect(errors).toContain("DB_PORT must be a valid port number (1-65535).");
    });
  });

  describe("assertPostgresConfig", () => {
    it("should not throw for valid configuration", () => {
      const config = {
        host: "localhost",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      expect(() => assertPostgresConfig(config, { isProduction: true })).not.toThrow();
    });

    it("should throw in production with invalid configuration", () => {
      const config = {
        host: "",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      expect(() => assertPostgresConfig(config, { isProduction: true })).toThrow(
        "Invalid PostgreSQL configuration"
      );
    });

    it("should warn but not throw in development with invalid configuration", () => {
      const config = {
        host: "",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpass",
        useInMemoryProjectRepo: false,
        allowInMemoryProjectRepoFallback: false,
      };

      expect(() => assertPostgresConfig(config, { isProduction: false })).not.toThrow();
    });
  });
});
