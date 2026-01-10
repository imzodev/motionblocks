import { AssetService } from "./asset.service";
import { BetterSqliteAssetRepository } from "./better-sqlite-asset-repository";
import { LocalFileStore } from "./local-file-store";

const repository = new BetterSqliteAssetRepository();
const fileStore = new LocalFileStore();

export const assetService = new AssetService(repository, fileStore);
