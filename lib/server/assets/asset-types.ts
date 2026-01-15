export type AssetType = "image" | "video" | "svg" | "text";

export type AssetScope = "project" | "global";

export type AssetPublic = {
  id: string;
  type: AssetType;
  scope: AssetScope;
  src?: string;
  mimeType?: string;
  originalName?: string;
  content?: string;
  name?: string;
  description?: string;
  whenToUse?: string;
  tags?: string[];
};

export type AssetRow = {
  id: string;
  scope: AssetScope;
  type: AssetType;
  mime_type: string | null;
  original_name: string | null;
  storage_path: string;
  created_at: number;
  name: string | null;
  description: string | null;
  when_to_use: string | null;
  tags: string | null;
};

export type AssetProjectLink = {
  asset_id: string;
  project_id: string;
};
