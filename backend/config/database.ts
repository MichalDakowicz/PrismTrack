export interface DatabaseConfig {
  uri: string;
  dbName: string;
  connectTimeoutMS: number;
  socketTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  useInMemoryProjectRepo: boolean;
  allowInMemoryProjectRepoFallback: boolean;
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

export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  return {
    uri: env.MONGODB_URI || "",
    dbName: env.MONGODB_DB_NAME || "prismtrack",
    connectTimeoutMS: parseNumber(env.MONGODB_CONNECT_TIMEOUT_MS, 10_000),
    socketTimeoutMS: parseNumber(env.MONGODB_SOCKET_TIMEOUT_MS, 45_000),
    serverSelectionTimeoutMS: parseNumber(env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 8_000),
    useInMemoryProjectRepo: parseBoolean(env.USE_IN_MEMORY_PROJECT_REPO, false),
    allowInMemoryProjectRepoFallback: parseBoolean(
      env.ALLOW_IN_MEMORY_PROJECT_REPO_FALLBACK,
      env.NODE_ENV !== "production"
    ),
  };
}

export function validateDatabaseConfig(config: DatabaseConfig): string[] {
  const errors: string[] = [];

  if (!config.useInMemoryProjectRepo && !config.uri.trim()) {
    errors.push("MONGODB_URI is required unless USE_IN_MEMORY_PROJECT_REPO=true.");
  }

  if (!config.dbName.trim()) {
    errors.push("MONGODB_DB_NAME is required.");
  }

  return errors;
}

export function assertDatabaseConfig(
  config: DatabaseConfig,
  options: { isProduction: boolean }
): void {
  const errors = validateDatabaseConfig(config);
  if (errors.length === 0) {
    return;
  }

  const message = `Invalid MongoDB configuration: ${errors.join(" ")}`;
  if (options.isProduction) {
    throw new Error(message);
  }

  console.warn(message);
}
