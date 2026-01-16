/**
 * Admin module types
 * Single Responsibility: Type definitions for admin features
 */

export interface GlobalAsset {
  id: string;
  type: "image" | "video" | "svg" | "text";
  scope: "global";
  src: string;
  mimeType: string;
  originalName: string;
  name?: string;
  description?: string;
  whenToUse?: string;
  tags?: string[];
}

export interface AssetMetadata {
  name?: string;
  description?: string;
  whenToUse?: string;
  tags?: string[];
}

export interface AssetFilter {
  search: string;
  type: "all" | "image" | "video" | "svg" | "text";
  tags: string[];
}

export interface UploadAssetParams {
  file: File;
  metadata: AssetMetadata;
}

export interface PromoteAssetParams {
  projectId: string;
  assetId: string;
  metadata: AssetMetadata & { name: string };
}
