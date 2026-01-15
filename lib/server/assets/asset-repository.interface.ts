import type { AssetRow, AssetScope, AssetType } from "./asset-types";

export interface CreateAssetRecord {
  id: string;
  scope: AssetScope;
  type: AssetType;
  mimeType: string;
  originalName: string;
  storagePath: string;
  createdAt: number;
  name?: string;
  description?: string;
  whenToUse?: string;
  tags?: string[];
}

export interface UpdateAssetMetadataRecord {
  name?: string;
  description?: string;
  whenToUse?: string;
  tags?: string[];
}

export interface CopyAssetResult {
  oldId: string;
  newId: string;
}

export interface AssetRepository {
  ensureProject(projectId: string): Promise<void>;
  createAsset(record: CreateAssetRecord): Promise<void>;
  getAssetById(id: string): Promise<AssetRow | null>;
  listAssetsByProject(projectId: string): Promise<Pick<AssetRow, "id" | "type" | "mime_type" | "original_name" | "scope">[]>;
  listAssetPathsByProject(projectId: string): Promise<Pick<AssetRow, "storage_path">[]>;
  deleteProject(projectId: string): Promise<void>;
  listGlobalAssets(): Promise<AssetRow[]>;
  updateAssetMetadata(id: string, metadata: UpdateAssetMetadataRecord): Promise<void>;
  updateAssetScope(id: string, scope: AssetScope): Promise<void>;
  linkAssetToProject(assetId: string, projectId: string): Promise<void>;
  unlinkAssetFromProject(assetId: string, projectId: string): Promise<void>;
  getProjectsForAsset(assetId: string): Promise<string[]>;
}
