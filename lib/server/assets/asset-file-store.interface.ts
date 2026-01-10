export interface AssetFileStore {
  saveFile(args: {
    projectId: string;
    assetId: string;
    ext: string;
    bytes: ArrayBuffer;
  }): Promise<{ storagePath: string }>;

  readFile(storagePath: string): Promise<Buffer>;

  deleteFile(storagePath: string): Promise<void>;

  deleteProjectDir(projectId: string): Promise<void>;
}
