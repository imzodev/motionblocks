import path from "path";
import fs from "fs/promises";
import Database from "better-sqlite3";

let dbPromise: Promise<any> | null = null;

export type SqliteDb = any;

export async function dbRun(db: any, sql: string, params: unknown[] = []): Promise<void> {
  db.prepare(sql).run(params as any);
}

export async function dbGet<T>(db: any, sql: string, params: unknown[] = []): Promise<T | undefined> {
  return db.prepare(sql).get(params as any) as T | undefined;
}

export async function dbAll<T>(db: any, sql: string, params: unknown[] = []): Promise<T[]> {
  return (db.prepare(sql).all(params as any) as T[]) || [];
}

function getDbFilePath(): string {
  return path.join(process.cwd(), "data", "motionblocks.db");
}

async function ensureDbDir(): Promise<void> {
  const dbFile = getDbFilePath();
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
}

export async function getMotionblocksDb(): Promise<any> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await ensureDbDir();

      const dbFile = getDbFilePath();
      const db = new Database(dbFile);
      db.pragma("foreign_keys = ON");

      await dbRun(
        db,
        "CREATE TABLE IF NOT EXISTS mb_projects (id TEXT PRIMARY KEY)"
      );

      await dbRun(
        db,
        [
          "CREATE TABLE IF NOT EXISTS mb_assets (",
          "  id TEXT PRIMARY KEY,",
          "  project_id TEXT NOT NULL,",
          "  type TEXT NOT NULL,",
          "  mime_type TEXT,",
          "  original_name TEXT,",
          "  storage_path TEXT NOT NULL,",
          "  created_at INTEGER NOT NULL,",
          "  FOREIGN KEY(project_id) REFERENCES mb_projects(id) ON DELETE CASCADE",
          ")",
        ].join("\n")
      );

      await dbRun(db, "CREATE INDEX IF NOT EXISTS mb_assets_project_id_idx ON mb_assets(project_id)");

      return db;
    })();
  }

  return dbPromise;
}
