import { NextResponse } from "next/server";
import fs from "fs/promises";
import { getMotionblocksDb, dbGet } from "@/lib/server/motionblocks-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: string;
  mime_type: string | null;
  storage_path: string;
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const db = await getMotionblocksDb();
  const row = await dbGet<AssetRow>(
    db,
    "SELECT id, type, mime_type, storage_path FROM mb_assets WHERE id = ?",
    [id]
  );

  if (!row) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  try {
    const file = await fs.readFile(row.storage_path);
    return new Response(file, {
      headers: {
        "Content-Type": row.mime_type || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset file missing" }, { status: 404 });
  }
}
