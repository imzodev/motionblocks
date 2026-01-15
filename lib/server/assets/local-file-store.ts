import path from "path";
import fs from "fs/promises";
import type { AssetFileStore } from "./asset-file-store.interface";

export class LocalFileStore implements AssetFileStore {
  async saveFile(args: {
    projectId: string | null;
    assetId: string;
    ext: string;
    bytes: ArrayBuffer;
    scope?: "project" | "global";
  }): Promise<{ storagePath: string }> {
    const scope = args.scope ?? "project";
    let assetDir: string;

    if (scope === "global") {
      assetDir = path.join(process.cwd(), "data", "assets", "global");
    } else {
      if (!args.projectId) {
        throw new Error("projectId is required for project-scoped assets");
      }
      assetDir = path.join(process.cwd(), "data", "assets", `proj_${args.projectId}`);
    }

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
    const dir = path.join(process.cwd(), "data", "assets", `proj_${projectId}`);
    await fs.rm(dir, { recursive: true, force: true });
  }

  async copyFile(fromPath: string, toPath: string): Promise<void> {
    const toDir = path.dirname(toPath);
    await fs.mkdir(toDir, { recursive: true });
    await fs.copyFile(fromPath, toPath);
  }
}
