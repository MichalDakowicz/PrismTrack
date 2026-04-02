import { Pool, PoolClient } from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export interface PostgresConnectionManager {
  connect: () => Promise<PoolClient>;
  getPool: () => Pool;
  ping: () => Promise<boolean>;
  close: () => Promise<void>;
  isConnected: () => boolean;
  ensureSchema: () => Promise<void>;
}

interface Deps {
  createPool?: (config: PoolConfig) => Pool;
  readSchema?: () => string;
}

interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export function createPostgresConnectionManager(
  config: PoolConfig,
  deps: Deps = {}
): PostgresConnectionManager {
  const createPool = deps.createPool || ((cfg: PoolConfig) => new Pool(cfg));

  // Default schema reader - reads from schema.sql in the same directory
  const readSchema = deps.readSchema || (() => {
    try {
      const currentDir = dirname(fileURLToPath(import.meta.url));
      const schemaPath = resolve(currentDir, "schema.sql");
      return readFileSync(schemaPath, "utf-8");
    } catch (error) {
      // If schema.sql can't be found, log the error and return empty
      console.warn("Failed to load schema.sql:", error);
      return "";
    }
  });

  // Set defaults for pool configuration
  const poolConfig: PoolConfig = {
    ...config,
    max: config.max ?? 10,
    idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis ?? 2000,
  };

  let pool: Pool | null = null;
  let connectingPromise: Promise<PoolClient> | null = null;

  async function ensureSchema(): Promise<void> {
    if (!pool) {
      throw new Error("PostgreSQL pool is not initialized. Call connect() first.");
    }

    const schema = readSchema();
    if (!schema.trim()) {
      return; // No schema to initialize
    }

    const client = await pool.connect();
    try {
      await client.query(schema);
    } finally {
      client.release();
    }
  }

  async function connectFresh(): Promise<PoolClient> {
    pool = createPool(poolConfig) as Pool;

    // Test the connection
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    
    // Initialize schema on fresh connection - this should succeed or fail loudly
    const schema = readSchema();
    if (schema.trim()) {
      const schemaClient = await pool.connect();
      try {
        await schemaClient.query(schema);
        console.log("PostgreSQL schema initialized successfully");
      } catch (error) {
        schemaClient.release();
        // Close the pool if schema initialization fails
        await pool.end();
        pool = null;
        throw new Error(`Failed to initialize PostgreSQL schema: ${error instanceof Error ? error.message : String(error)}`);
      }
      schemaClient.release();
    }

    return pool.connect();
  }

  async function connect(): Promise<PoolClient> {
    if (pool) {
      try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        // Return a new client for actual use
        return pool.connect();
      } catch {
        await close();
      }
    }

    if (connectingPromise) {
      return connectingPromise;
    }

    connectingPromise = connectFresh().finally(() => {
      connectingPromise = null;
    });

    return connectingPromise;
  }

  function getPool(): Pool {
    if (!pool) {
      throw new Error("PostgreSQL pool is not initialized. Call connect() first.");
    }
    return pool;
  }

  async function ping(): Promise<boolean> {
    if (!pool) {
      return false;
    }

    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  async function close(): Promise<void> {
    connectingPromise = null;
    if (pool) {
      try {
        await pool.end();
      } catch {
        // Best effort close
      }
    }
    pool = null;
  }

  function isConnected(): boolean {
    return !!pool;
  }

  return {
    connect,
    getPool,
    ping,
    close,
    isConnected,
    ensureSchema,
  };
}
