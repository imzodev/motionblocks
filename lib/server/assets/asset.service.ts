import type { AssetRepository } from "./asset-repository.interface";
import type { AssetFileStore } from "./asset-file-store.interface";
import type { AssetPublic, AssetType } from "./asset-types";

export class AssetService {
  private readonly repository: AssetRepository;
  private readonly fileStore: AssetFileStore;

  constructor(repository: AssetRepository, fileStore: AssetFileStore) {
    this.repository = repository;
    this.fileStore = fileStore;
  }

  async uploadFile(projectId: string, file: File): Promise<AssetPublic> {
    const mimeType = file.type || "application/octet-stream";
    const type = this.detectAssetType(mimeType);
    const originalName = this.sanitizeFileName(file.name || "upload");

    const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ext = this.guessExt(mimeType, originalName);

    const bytes = await file.arrayBuffer();
    const { storagePath } = await this.fileStore.saveFile({ projectId, assetId, ext, bytes });

    await this.repository.ensureProject(projectId);
    await this.repository.createAsset({
      id: assetId,
      projectId,
      type,
      mimeType,
      originalName,
      storagePath,
      createdAt: Date.now(),
    });

    return { id: assetId, type, src: `/api/assets/${assetId}` };
  }

  async listProjectAssets(projectId: string): Promise<AssetPublic[]> {
    const rows = await this.repository.listAssetsByProject(projectId);
    return rows.map((r) => ({ id: r.id, type: r.type, src: `/api/assets/${r.id}` }));
  }

  async getAssetFile(assetId: string): Promise<{ bytes: Buffer; mimeType: string | null } | null> {
    const row = await this.repository.getAssetById(assetId);
    if (!row) return null;

    try {
      const bytes = await this.fileStore.readFile(row.storage_path);
      return { bytes, mimeType: row.mime_type };
    } catch {
      return null;
    }
  }

  async deleteProjectAssets(projectId: string): Promise<void> {
    const paths = await this.repository.listAssetPathsByProject(projectId);

    await Promise.all(
      paths.map(async (p) => {
        try {
          await this.fileStore.deleteFile(p.storage_path);
        } catch {
          // ignore
        }
      })
    );

    await this.repository.deleteProject(projectId);

    try {
      await this.fileStore.deleteProjectDir(projectId);
    } catch {
      // ignore
    }
  }

  private detectAssetType(mime: string): AssetType {
    if (mime === "image/svg+xml") return "svg";
    if (mime.startsWith("video/")) return "video";
    return "image";
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  private guessExt(mime: string, filename: string): string {
    const lower = filename.toLowerCase();
    const idx = lower.lastIndexOf(".");
    if (idx !== -1) return lower.slice(idx);

    if (mime === "image/svg+xml") return ".svg";
    if (mime === "image/png") return ".png";
    if (mime === "image/jpeg") return ".jpg";
    if (mime === "image/webp") return ".webp";
    if (mime === "video/mp4") return ".mp4";
    if (mime === "video/webm") return ".webm";
    if (mime === "video/quicktime") return ".mov";
    return "";
  }
}
