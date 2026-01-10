import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getMotionblocksDb, dbRun } from "@/lib/server/motionblocks-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function detectAssetType(mime: string): "image" | "video" | "svg" {
  if (mime === "image/svg+xml") return "svg";
  if (mime.startsWith("video/")) return "video";
  return "image";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function guessExt(mime: string, filename: string): string {
  const lower = filename.toLowerCase();
  const ext = path.extname(lower);
  if (ext) return ext;

  if (mime === "image/svg+xml") return ".svg";
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/webm") return ".webm";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const assetType = detectAssetType(mimeType);
    const originalName = sanitizeFileName(file.name || "upload");

    const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ext = guessExt(mimeType, originalName);

    const assetDir = path.join(process.cwd(), "data", "assets", projectId);
    await fs.mkdir(assetDir, { recursive: true });

    const fileName = `${assetId}${ext}`;
    const storagePath = path.join(assetDir, fileName);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(storagePath, Buffer.from(bytes));

    const db = await getMotionblocksDb();
    await dbRun(db, "INSERT OR IGNORE INTO mb_projects(id) VALUES (?)", [projectId]);
    await dbRun(
      db,
      [
        "INSERT INTO mb_assets(",
        "  id, project_id, type, mime_type, original_name, storage_path, created_at",
        ") VALUES (?, ?, ?, ?, ?, ?, ?)",
      ].join("\n"),
      [assetId, projectId, assetType, mimeType, originalName, storagePath, Date.now()]
    );

    return NextResponse.json({
      asset: {
        id: assetId,
        type: assetType,
        src: `/api/assets/${assetId}`,
      },
    });
  } catch (error) {
    console.error("/api/assets/upload failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Upload failed", message }, { status: 500 });
  }
}
