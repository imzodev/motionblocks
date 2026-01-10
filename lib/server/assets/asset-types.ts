export type AssetType = "image" | "video" | "svg" | "text";

export type AssetPublic = {
  id: string;
  type: AssetType;
  src?: string;
  content?: string;
};

export type AssetRow = {
  id: string;
  project_id: string;
  type: AssetType;
  mime_type: string | null;
  original_name: string | null;
  storage_path: string;
  created_at: number;
};
