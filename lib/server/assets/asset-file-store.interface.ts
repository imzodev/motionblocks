export interface AssetFileStore {
  saveFile(args: {
    projectId: string | null;
    assetId: string;
    ext: string;
    bytes: ArrayBuffer;
    scope?: "project" | "global";
  }): Promise<{ storagePath: string }>;

  readFile(storagePath: string): Promise<Buffer>;

  deleteFile(storagePath: string): Promise<void>;

  deleteProjectDir(projectId: string): Promise<void>;

  copyFile(fromPath: string, toPath: string): Promise<void>;
}
