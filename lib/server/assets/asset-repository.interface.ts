import type { AssetRow, AssetType } from "./asset-types";

export interface CreateAssetRecord {
  id: string;
  projectId: string;
  type: AssetType;
  mimeType: string;
  originalName: string;
  storagePath: string;
  createdAt: number;
}

export interface AssetRepository {
  ensureProject(projectId: string): Promise<void>;
  createAsset(record: CreateAssetRecord): Promise<void>;
  getAssetById(id: string): Promise<AssetRow | null>;
  listAssetsByProject(projectId: string): Promise<Pick<AssetRow, "id" | "type">[]>;
  listAssetPathsByProject(projectId: string): Promise<Pick<AssetRow, "storage_path">[]>;
  deleteProject(projectId: string): Promise<void>;
}
