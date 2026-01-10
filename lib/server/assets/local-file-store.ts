import path from "path";
import fs from "fs/promises";
import type { AssetFileStore } from "./asset-file-store.interface";

export class LocalFileStore implements AssetFileStore {
  async saveFile(args: { projectId: string; assetId: string; ext: string; bytes: ArrayBuffer }): Promise<{ storagePath: string }> {
    const assetDir = path.join(process.cwd(), "data", "assets", args.projectId);
    await fs.mkdir(assetDir, { recursive: true });

    const fileName = `${args.assetId}${args.ext}`;
    const storagePath = path.join(assetDir, fileName);
    await fs.writeFile(storagePath, Buffer.from(args.bytes));

    return { storagePath };
  }

  async readFile(storagePath: string): Promise<Buffer> {
    return await fs.readFile(storagePath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    await fs.rm(storagePath, { force: true });
  }

  async deleteProjectDir(projectId: string): Promise<void> {
    const dir = path.join(process.cwd(), "data", "assets", projectId);
    await fs.rm(dir, { recursive: true, force: true });
  }
}
