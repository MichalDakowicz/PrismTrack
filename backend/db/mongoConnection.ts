import { Db, MongoClient } from "mongodb";
import { DatabaseConfig } from "../config/database";

export interface MongoConnectionManager {
  connect: () => Promise<Db>;
  getDb: () => Db;
  ping: () => Promise<boolean>;
  close: () => Promise<void>;
  isConnected: () => boolean;
}

interface Deps {
  createClient?: (uri: string, options: ConstructorParameters<typeof MongoClient>[1]) => MongoClient;
}

export function createMongoConnectionManager(
  config: DatabaseConfig,
  deps: Deps = {}
): MongoConnectionManager {
  const createClient = deps.createClient || ((uri: string, options: ConstructorParameters<typeof MongoClient>[1]) => new MongoClient(uri, options));

  let client: MongoClient | null = null;
  let db: Db | null = null;

  async function connect(): Promise<Db> {
    if (db) {
      return db;
    }

    client = createClient(config.uri, {
      connectTimeoutMS: config.connectTimeoutMS,
      socketTimeoutMS: config.socketTimeoutMS,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    });

    await client.connect();
    db = client.db(config.dbName);
    return db;
  }

  function getDb(): Db {
    if (!db) {
      throw new Error("MongoDB is not connected");
    }
    return db;
  }

  async function ping(): Promise<boolean> {
    if (!db) {
      return false;
    }

    try {
      await db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async function close(): Promise<void> {
    if (client) {
      await client.close();
    }
    client = null;
    db = null;
  }

  function isConnected(): boolean {
    return !!db;
  }

  return {
    connect,
    getDb,
    ping,
    close,
    isConnected,
  };
}
