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
  let connectingPromise: Promise<Db> | null = null;

  async function resetConnection(): Promise<void> {
    if (client) {
      try {
        await client.close();
      } catch {
        // Best effort close; we'll recreate the client anyway.
      }
    }
    client = null;
    db = null;
  }

  async function connectFresh(): Promise<Db> {
    const nextClient = createClient(config.uri, {
      connectTimeoutMS: config.connectTimeoutMS,
      socketTimeoutMS: config.socketTimeoutMS,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    });

    await nextClient.connect();
    client = nextClient;
    db = nextClient.db(config.dbName);
    return db;
  }

  async function connect(): Promise<Db> {
    if (db && client) {
      try {
        await db.command({ ping: 1 });
        return db;
      } catch {
        await resetConnection();
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
    connectingPromise = null;
    await resetConnection();
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
