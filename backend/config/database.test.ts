import { describe, expect, it } from "vitest";
import { assertDatabaseConfig, getDatabaseConfig, validateDatabaseConfig } from "./database";

describe("database config", () => {
  it("parses values and defaults", () => {
    const config = getDatabaseConfig({
      DB_HOST: "localhost",
      DB_PORT: "5432",
      DB_NAME: "prismtrack-dev",
      DB_USER: "testuser",
      DB_PASSWORD: "testpass",
      USE_IN_MEMORY_PROJECT_REPO: "false",
      ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK: "true",
      NODE_ENV: "development",
    });

    expect(config.host).toBe("localhost");
    expect(config.port).toBe(5432);
    expect(config.database).toBe("prismtrack-dev");
    expect(config.user).toBe("testuser");
    expect(config.password).toBe("testpass");
    expect(config.useInMemoryProjectRepo).toBe(false);
    expect(config.allowInMemoryProjectRepoFallback).toBe(true);
    expect(config.max).toBe(10);
  });

  it("validates missing host when not using in-memory mode", () => {
    const config = getDatabaseConfig({
      DB_NAME: "prismtrack",
      NODE_ENV: "production",
    });

    const errors = validateDatabaseConfig(config);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("DB_HOST");
  });

  it("throws in production on invalid config", () => {
    const config = getDatabaseConfig({ DB_NAME: "prismtrack" });
    expect(() => assertDatabaseConfig(config, { isProduction: true })).toThrow();
  });
});
