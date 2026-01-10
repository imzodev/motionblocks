import { NextResponse } from "next/server";
import { assetService } from "@/lib/server/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const result = await assetService.getAssetFile(id);
  if (!result) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(result.bytes), {
    headers: {
      "Content-Type": result.mimeType || "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
