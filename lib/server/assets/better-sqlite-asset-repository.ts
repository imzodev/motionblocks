import type { AssetRepository, CreateAssetRecord } from "./asset-repository.interface";
import type { AssetRow } from "./asset-types";
import { getMotionblocksDb } from "../motionblocks-db";

export class BetterSqliteAssetRepository implements AssetRepository {
  async ensureProject(projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("INSERT OR IGNORE INTO mb_projects(id) VALUES (?)").run(projectId);
  }

  async createAsset(record: CreateAssetRecord): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare(
      [
        "INSERT INTO mb_assets(",
        "  id, project_id, type, mime_type, original_name, storage_path, created_at",
        ") VALUES (?, ?, ?, ?, ?, ?, ?)",
      ].join("\n")
    ).run(
      record.id,
      record.projectId,
      record.type,
      record.mimeType,
      record.originalName,
      record.storagePath,
      record.createdAt
    );
  }

  async getAssetById(id: string): Promise<AssetRow | null> {
    const db = await getMotionblocksDb();
    const row = db
      .prepare(
        "SELECT id, project_id, type, mime_type, original_name, storage_path, created_at FROM mb_assets WHERE id = ?"
      )
      .get(id) as AssetRow | undefined;

    return row ?? null;
  }

  async listAssetsByProject(projectId: string): Promise<Pick<AssetRow, "id" | "type">[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare("SELECT id, type FROM mb_assets WHERE project_id = ? ORDER BY created_at DESC")
      .all(projectId) as Pick<AssetRow, "id" | "type">[];

    return rows || [];
  }

  async listAssetPathsByProject(projectId: string): Promise<Pick<AssetRow, "storage_path">[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare("SELECT storage_path FROM mb_assets WHERE project_id = ?")
      .all(projectId) as Pick<AssetRow, "storage_path">[];

    return rows || [];
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("DELETE FROM mb_projects WHERE id = ?").run(projectId);
  }
}
