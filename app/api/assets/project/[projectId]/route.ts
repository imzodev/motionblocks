import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getMotionblocksDb, dbAll, dbRun } from "@/lib/server/motionblocks-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: "image" | "video" | "svg" | "text";
};

type AssetPathRow = {
  storage_path: string;
};

export async function GET(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const db = await getMotionblocksDb();
  const rows = await dbAll<AssetRow>(
    db,
    "SELECT id, type FROM mb_assets WHERE project_id = ? ORDER BY created_at DESC",
    [projectId]
  );

  const assets = rows.map((r) => ({
    id: r.id,
    type: r.type,
    src: `/api/assets/${r.id}`,
  }));

  return NextResponse.json({ assets });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const db = await getMotionblocksDb();

  const paths = await dbAll<AssetPathRow>(
    db,
    "SELECT storage_path FROM mb_assets WHERE project_id = ?",
    [projectId]
  );

  await Promise.all(
    paths.map(async (p) => {
      try {
        await fs.rm(p.storage_path, { force: true });
      } catch {
        // ignore
      }
    })
  );

  // Delete the project row; mb_assets rows will cascade delete via FK
  await dbRun(db, "DELETE FROM mb_projects WHERE id = ?", [projectId]);

  // Also remove the project asset directory if present
  const dir = path.join(process.cwd(), "data", "assets", projectId);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
