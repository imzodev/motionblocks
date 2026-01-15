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

async function ensureGlobalAssetsDir(): Promise<void> {
  const globalDir = path.join(process.cwd(), "data", "assets", "global");
  await fs.mkdir(globalDir, { recursive: true });
}

function columnExists(db: any, table: string, column: string): boolean {
  const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return info.some((col) => col.name === column);
}

function tableExists(db: any, table: string): boolean {
  const result = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(table);
  return !!result;
}

async function runMigrations(db: any): Promise<void> {
  if (!columnExists(db, "mb_assets", "scope")) {
    db.prepare("ALTER TABLE mb_assets ADD COLUMN scope TEXT NOT NULL DEFAULT 'project'").run();
  }

  if (!columnExists(db, "mb_assets", "name")) {
    db.prepare("ALTER TABLE mb_assets ADD COLUMN name TEXT").run();
  }

  if (!columnExists(db, "mb_assets", "description")) {
    db.prepare("ALTER TABLE mb_assets ADD COLUMN description TEXT").run();
  }

  if (!columnExists(db, "mb_assets", "when_to_use")) {
    db.prepare("ALTER TABLE mb_assets ADD COLUMN when_to_use TEXT").run();
  }

  if (!columnExists(db, "mb_assets", "tags")) {
    db.prepare("ALTER TABLE mb_assets ADD COLUMN tags TEXT").run();
  }

  if (!tableExists(db, "mb_asset_projects")) {
    db.prepare(
      [
        "CREATE TABLE mb_asset_projects (",
        "  asset_id TEXT NOT NULL,",
        "  project_id TEXT NOT NULL,",
        "  PRIMARY KEY (asset_id, project_id),",
        "  FOREIGN KEY(asset_id) REFERENCES mb_assets(id) ON DELETE CASCADE,",
        "  FOREIGN KEY(project_id) REFERENCES mb_projects(id) ON DELETE CASCADE",
        ")",
      ].join("\n")
    ).run();
    db.prepare("CREATE INDEX mb_asset_projects_asset_idx ON mb_asset_projects(asset_id)").run();
    db.prepare("CREATE INDEX mb_asset_projects_project_idx ON mb_asset_projects(project_id)").run();
  }

  if (columnExists(db, "mb_assets", "project_id")) {
    const assetsWithProject = db
      .prepare("SELECT id, project_id FROM mb_assets WHERE project_id IS NOT NULL")
      .all() as { id: string; project_id: string }[];

    for (const asset of assetsWithProject) {
      db.prepare("INSERT OR IGNORE INTO mb_asset_projects (asset_id, project_id) VALUES (?, ?)").run(
        asset.id,
        asset.project_id
      );
    }
  }

  const indexExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='mb_assets_scope_idx'")
    .get();
  if (!indexExists) {
    db.prepare("CREATE INDEX mb_assets_scope_idx ON mb_assets(scope)").run();
  }
}

export async function getMotionblocksDb(): Promise<any> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await ensureDbDir();
      await ensureGlobalAssetsDir();

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
          "  scope TEXT NOT NULL DEFAULT 'project',",
          "  type TEXT NOT NULL,",
          "  mime_type TEXT,",
          "  original_name TEXT,",
          "  storage_path TEXT NOT NULL,",
          "  created_at INTEGER NOT NULL,",
          "  name TEXT,",
          "  description TEXT,",
          "  when_to_use TEXT,",
          "  tags TEXT",
          ")",
        ].join("\n")
      );

      await dbRun(
        db,
        [
          "CREATE TABLE IF NOT EXISTS mb_asset_projects (",
          "  asset_id TEXT NOT NULL,",
          "  project_id TEXT NOT NULL,",
          "  PRIMARY KEY (asset_id, project_id),",
          "  FOREIGN KEY(asset_id) REFERENCES mb_assets(id) ON DELETE CASCADE,",
          "  FOREIGN KEY(project_id) REFERENCES mb_projects(id) ON DELETE CASCADE",
          ")",
        ].join("\n")
      );

      await dbRun(db, "CREATE INDEX IF NOT EXISTS mb_asset_projects_asset_idx ON mb_asset_projects(asset_id)");
      await dbRun(db, "CREATE INDEX IF NOT EXISTS mb_asset_projects_project_idx ON mb_asset_projects(project_id)");
      await dbRun(db, "CREATE INDEX IF NOT EXISTS mb_assets_scope_idx ON mb_assets(scope)");

      await runMigrations(db);

      return db;
    })();
  }

  return dbPromise;
}
