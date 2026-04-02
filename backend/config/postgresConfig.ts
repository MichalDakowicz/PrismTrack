export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  useInMemoryProjectRepo: boolean;
  allowInMemoryProjectRepoFallback: boolean;
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }
  return parsed;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return defaultValue;
}

export function getPostgresConfig(env: NodeJS.ProcessEnv = process.env): PostgresConfig {
  return {
    host: env.DB_HOST || "",
    port: parseNumber(env.DB_PORT, 5432),
    database: env.DB_NAME || "prismtrack",
    user: env.DB_USER || "",
    password: env.DB_PASSWORD || "",
    max: parseNumber(env.DB_POOL_MAX, 10),
    idleTimeoutMillis: parseNumber(env.DB_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: parseNumber(env.DB_CONNECTION_TIMEOUT_MS, 2000),
    useInMemoryProjectRepo: parseBoolean(env.USE_IN_MEMORY_PROJECT_REPO, false),
    allowInMemoryProjectRepoFallback: parseBoolean(
      env.ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK,
      env.NODE_ENV !== "production"
    ),
  };
}

export function validatePostgresConfig(config: PostgresConfig): string[] {
  const errors: string[] = [];

  if (!config.useInMemoryProjectRepo && !config.host.trim()) {
    errors.push("DB_HOST is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
  }

  if (!config.useInMemoryProjectRepo && !config.user.trim()) {
    errors.push("DB_USER is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
  }

  if (!config.useInMemoryProjectRepo && !config.database.trim()) {
    errors.push("DB_NAME is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
  }

  if (config.port <= 0 || config.port > 65535) {
    errors.push("DB_PORT must be a valid port number (1-65535).");
  }

  return errors;
}

export function assertPostgresConfig(
  config: PostgresConfig,
  options: { isProduction: boolean }
): void {
  const errors = validatePostgresConfig(config);
  if (errors.length === 0) {
    return;
  }

  const message = `Invalid PostgreSQL configuration: ${errors.join(" ")}`;
  if (options.isProduction) {
    throw new Error(message);
  }

  console.warn(message);
}
