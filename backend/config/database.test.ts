import { describe, expect, it } from "vitest";
import { assertDatabaseConfig, getDatabaseConfig, validateDatabaseConfig } from "./database";

describe("database config", () => {
  it("parses values and defaults", () => {
    const config = getDatabaseConfig({
      MONGODB_URI: "mongodb://localhost:27017",
      MONGODB_DB_NAME: "prismtrack-dev",
      USE_IN_MEMORY_PROJECT_REPO: "false",
      ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK: "true",
      NODE_ENV: "development",
    });

    expect(config.uri).toBe("mongodb://localhost:27017");
    expect(config.dbName).toBe("prismtrack-dev");
    expect(config.useInMemoryProjectRepo).toBe(false);
    expect(config.allowInMemoryProjectRepoFallback).toBe(true);
    expect(config.connectTimeoutMS).toBe(10_000);
  });

  it("validates missing URI when not using in-memory mode", () => {
    const config = getDatabaseConfig({
      MONGODB_DB_NAME: "prismtrack",
      NODE_ENV: "production",
    });

    const errors = validateDatabaseConfig(config);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("MONGODB_URI");
  });

  it("throws in production on invalid config", () => {
    const config = getDatabaseConfig({ MONGODB_DB_NAME: "prismtrack" });
    expect(() => assertDatabaseConfig(config, { isProduction: true })).toThrow();
  });
});
