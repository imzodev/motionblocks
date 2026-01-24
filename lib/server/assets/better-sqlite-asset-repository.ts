import type { AssetRepository, CreateAssetRecord, UpdateAssetMetadataRecord } from "./asset-repository.interface";
import type { AssetRow, AssetScope } from "./asset-types";
import { getMotionblocksDb } from "../motionblocks-db";

export class BetterSqliteAssetRepository implements AssetRepository {
  async ensureProject(projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("INSERT OR IGNORE INTO mb_projects(id) VALUES (?)").run(projectId);
  }

  async createAsset(record: CreateAssetRecord): Promise<void> {
    const db = await getMotionblocksDb();
    const tagsJson = record.tags ? JSON.stringify(record.tags) : null;
    db.prepare(
      [
        "INSERT INTO mb_assets(",
        "  id, scope, type, mime_type, original_name, storage_path, created_at, name, description, when_to_use, tags",
        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ].join("\n")
    ).run(
      record.id,
      record.scope,
      record.type,
      record.mimeType,
      record.originalName,
      record.storagePath,
      record.createdAt,
      record.name ?? null,
      record.description ?? null,
      record.whenToUse ?? null,
      tagsJson
    );
  }

  async getAssetById(id: string): Promise<AssetRow | null> {
    const db = await getMotionblocksDb();
    const row = db
      .prepare(
        "SELECT id, scope, type, mime_type, original_name, storage_path, created_at, name, description, when_to_use, tags FROM mb_assets WHERE id = ?"
      )
      .get(id) as AssetRow | undefined;

    return row ?? null;
  }

  async listAssetsByProject(
    projectId: string
  ): Promise<Pick<AssetRow, "id" | "type" | "mime_type" | "original_name" | "scope">[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare(
        [
          "SELECT a.id, a.type, a.mime_type, a.original_name, a.scope",
          "FROM mb_assets a",
          "INNER JOIN mb_asset_projects ap ON a.id = ap.asset_id",
          "WHERE ap.project_id = ?",
          "ORDER BY a.created_at DESC",
        ].join(" ")
      )
      .all(projectId) as Pick<AssetRow, "id" | "type" | "mime_type" | "original_name" | "scope">[];

    return rows || [];
  }

  async listAssetPathsByProject(projectId: string): Promise<Pick<AssetRow, "storage_path">[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare(
        [
          "SELECT a.storage_path",
          "FROM mb_assets a",
          "INNER JOIN mb_asset_projects ap ON a.id = ap.asset_id",
          "WHERE ap.project_id = ?",
        ].join(" ")
      )
      .all(projectId) as Pick<AssetRow, "storage_path">[];

    return rows || [];
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("DELETE FROM mb_projects WHERE id = ?").run(projectId);
  }

  async deleteAssetById(id: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("DELETE FROM mb_assets WHERE id = ?").run(id);
  }

  async listGlobalAssets(): Promise<AssetRow[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare(
        "SELECT id, scope, type, mime_type, original_name, storage_path, created_at, name, description, when_to_use, tags FROM mb_assets WHERE scope = 'global' ORDER BY created_at DESC"
      )
      .all() as AssetRow[];

    return rows || [];
  }

  async updateAssetMetadata(id: string, metadata: UpdateAssetMetadataRecord): Promise<void> {
    const db = await getMotionblocksDb();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (metadata.name !== undefined) {
      updates.push("name = ?");
      params.push(metadata.name);
    }
    if (metadata.description !== undefined) {
      updates.push("description = ?");
      params.push(metadata.description);
    }
    if (metadata.whenToUse !== undefined) {
      updates.push("when_to_use = ?");
      params.push(metadata.whenToUse);
    }
    if (metadata.tags !== undefined) {
      updates.push("tags = ?");
      params.push(JSON.stringify(metadata.tags));
    }

    if (updates.length === 0) return;

    params.push(id);
    db.prepare(`UPDATE mb_assets SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  }

  async updateAssetScope(id: string, scope: AssetScope): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("UPDATE mb_assets SET scope = ? WHERE id = ?").run(scope, id);
  }

  async linkAssetToProject(assetId: string, projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("INSERT OR IGNORE INTO mb_asset_projects (asset_id, project_id) VALUES (?, ?)").run(assetId, projectId);
  }

  async unlinkAssetFromProject(assetId: string, projectId: string): Promise<void> {
    const db = await getMotionblocksDb();
    db.prepare("DELETE FROM mb_asset_projects WHERE asset_id = ? AND project_id = ?").run(assetId, projectId);
  }

  async getProjectsForAsset(assetId: string): Promise<string[]> {
    const db = await getMotionblocksDb();
    const rows = db
      .prepare("SELECT project_id FROM mb_asset_projects WHERE asset_id = ?")
      .all(assetId) as { project_id: string }[];

    return rows.map((r) => r.project_id);
  }
}
