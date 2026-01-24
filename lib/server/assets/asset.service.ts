import path from "path";
import type { AssetRepository, CopyAssetResult, UpdateAssetMetadataRecord } from "./asset-repository.interface";
import type { AssetFileStore } from "./asset-file-store.interface";
import type { AssetPublic, AssetRow, AssetScope, AssetType } from "./asset-types";

export class AssetService {
  private readonly repository: AssetRepository;
  private readonly fileStore: AssetFileStore;

  constructor(repository: AssetRepository, fileStore: AssetFileStore) {
    this.repository = repository;
    this.fileStore = fileStore;
  }

  async deleteGlobalAsset(assetId: string): Promise<boolean> {
    const row = await this.repository.getAssetById(assetId);
    if (!row || row.scope !== "global") {
      return false;
    }

    try {
      await this.fileStore.deleteFile(row.storage_path);
    } catch {
      // ignore
    }

    await this.repository.deleteAssetById(assetId);
    return true;
  }

  async deleteGlobalAssets(assetIds: string[]): Promise<{ deleted: string[]; notFoundOrNotGlobal: string[] }> {
    const deleted: string[] = [];
    const notFoundOrNotGlobal: string[] = [];

    for (const assetId of assetIds) {
      const ok = await this.deleteGlobalAsset(assetId);
      if (ok) {
        deleted.push(assetId);
      } else {
        notFoundOrNotGlobal.push(assetId);
      }
    }

    return { deleted, notFoundOrNotGlobal };
  }

  async uploadFile(projectId: string, file: File): Promise<AssetPublic> {
    const mimeType = file.type || "application/octet-stream";
    const type = this.detectAssetType(mimeType);
    const originalName = this.sanitizeFileName(file.name || "upload");

    const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ext = this.guessExt(mimeType, originalName);

    const bytes = await file.arrayBuffer();
    const { storagePath } = await this.fileStore.saveFile({ projectId, assetId, ext, bytes, scope: "project" });

    await this.repository.ensureProject(projectId);
    await this.repository.createAsset({
      id: assetId,
      scope: "project",
      type,
      mimeType,
      originalName,
      storagePath,
      createdAt: Date.now(),
    });

    await this.repository.linkAssetToProject(assetId, projectId);

    return { id: assetId, type, scope: "project", src: `/api/assets/${assetId}`, mimeType, originalName };
  }

  async uploadGlobalFile(
    file: File,
    metadata?: { name?: string; description?: string; whenToUse?: string; tags?: string[] }
  ): Promise<AssetPublic> {
    const mimeType = file.type || "application/octet-stream";
    const type = this.detectAssetType(mimeType);
    const originalName = this.sanitizeFileName(file.name || "upload");

    const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ext = this.guessExt(mimeType, originalName);

    const bytes = await file.arrayBuffer();
    const { storagePath } = await this.fileStore.saveFile({ projectId: null, assetId, ext, bytes, scope: "global" });

    await this.repository.createAsset({
      id: assetId,
      scope: "global",
      type,
      mimeType,
      originalName,
      storagePath,
      createdAt: Date.now(),
      name: metadata?.name,
      description: metadata?.description,
      whenToUse: metadata?.whenToUse,
      tags: metadata?.tags,
    });

    return {
      id: assetId,
      type,
      scope: "global",
      src: `/api/assets/global/${assetId}`,
      mimeType,
      originalName,
      name: metadata?.name,
      description: metadata?.description,
      whenToUse: metadata?.whenToUse,
      tags: metadata?.tags,
    };
  }

  async listProjectAssets(projectId: string): Promise<AssetPublic[]> {
    const rows = await this.repository.listAssetsByProject(projectId);
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      scope: r.scope,
      src: `/api/assets/${r.id}`,
      mimeType: r.mime_type ?? undefined,
      originalName: r.original_name ?? undefined,
    }));
  }

  async listGlobalAssets(): Promise<AssetPublic[]> {
    const rows = await this.repository.listGlobalAssets();
    return rows.map((r) => this.rowToPublic(r, "global"));
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

  async copyProjectAssets(
    fromProjectId: string,
    toProjectId: string,
    assetIds: string[]
  ): Promise<CopyAssetResult[]> {
    const results: CopyAssetResult[] = [];

    await this.repository.ensureProject(toProjectId);

    for (const oldId of assetIds) {
      const oldRow = await this.repository.getAssetById(oldId);
      if (!oldRow || oldRow.scope !== "project") {
        continue;
      }

      const linkedProjects = await this.repository.getProjectsForAsset(oldId);
      if (!linkedProjects.includes(fromProjectId)) {
        continue;
      }

      const newId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const ext = path.extname(oldRow.storage_path);
      const newStoragePath = path.join(
        process.cwd(),
        "data",
        "assets",
        `proj_${toProjectId}`,
        `${newId}${ext}`
      );

      await this.fileStore.copyFile(oldRow.storage_path, newStoragePath);

      await this.repository.createAsset({
        id: newId,
        scope: "project",
        type: oldRow.type,
        mimeType: oldRow.mime_type ?? "",
        originalName: oldRow.original_name ?? "",
        storagePath: newStoragePath,
        createdAt: Date.now(),
      });

      await this.repository.linkAssetToProject(newId, toProjectId);

      results.push({ oldId, newId });
    }

    return results;
  }

  async linkAssetToProject(assetId: string, projectId: string): Promise<boolean> {
    const row = await this.repository.getAssetById(assetId);
    if (!row) return false;

    await this.repository.ensureProject(projectId);
    await this.repository.linkAssetToProject(assetId, projectId);
    return true;
  }

  async unlinkAssetFromProject(assetId: string, projectId: string): Promise<boolean> {
    await this.repository.unlinkAssetFromProject(assetId, projectId);
    return true;
  }

  async promoteToGlobal(
    projectId: string,
    assetId: string,
    metadata: { name: string; description?: string; whenToUse?: string; tags?: string[] }
  ): Promise<AssetPublic | null> {
    const row = await this.repository.getAssetById(assetId);
    if (!row || row.scope !== "project") {
      return null;
    }

    const linkedProjects = await this.repository.getProjectsForAsset(assetId);
    if (!linkedProjects.includes(projectId)) {
      return null;
    }

    const ext = path.extname(row.storage_path);
    const newStoragePath = path.join(process.cwd(), "data", "assets", "global", `${assetId}${ext}`);

    await this.fileStore.copyFile(row.storage_path, newStoragePath);

    await this.repository.updateAssetScope(assetId, "global");
    await this.repository.updateAssetMetadata(assetId, metadata);

    const updatedRow = await this.repository.getAssetById(assetId);
    if (!updatedRow) return null;

    return this.rowToPublic(updatedRow, "global");
  }

  async updateGlobalAssetMetadata(assetId: string, metadata: UpdateAssetMetadataRecord): Promise<AssetPublic | null> {
    const row = await this.repository.getAssetById(assetId);
    if (!row || row.scope !== "global") {
      return null;
    }

    await this.repository.updateAssetMetadata(assetId, metadata);

    const updatedRow = await this.repository.getAssetById(assetId);
    if (!updatedRow) return null;

    return this.rowToPublic(updatedRow, "global");
  }

  private rowToPublic(row: AssetRow, scope: AssetScope): AssetPublic {
    const srcBase = scope === "global" ? "/api/assets/global" : "/api/assets";
    let tags: string[] | undefined;
    if (row.tags) {
      try {
        tags = JSON.parse(row.tags);
      } catch {
        tags = undefined;
      }
    }

    return {
      id: row.id,
      type: row.type,
      scope,
      src: `${srcBase}/${row.id}`,
      mimeType: row.mime_type ?? undefined,
      originalName: row.original_name ?? undefined,
      name: row.name ?? undefined,
      description: row.description ?? undefined,
      whenToUse: row.when_to_use ?? undefined,
      tags,
    };
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
