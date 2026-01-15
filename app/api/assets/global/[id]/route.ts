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

  const { bytes, mimeType } = result;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const { name, description, whenToUse, tags } = body as {
      name?: string;
      description?: string;
      whenToUse?: string;
      tags?: string[];
    };

    const asset = await assetService.updateGlobalAssetMetadata(id, {
      name,
      description,
      whenToUse,
      tags,
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found or not global" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("/api/assets/global/[id] PATCH failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Update failed", message }, { status: 500 });
  }
}
