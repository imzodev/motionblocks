import { NextResponse } from "next/server";
import { assetService } from "@/lib/server/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const assets = await assetService.listProjectAssets(projectId);
  return NextResponse.json({ assets });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  await assetService.deleteProjectAssets(projectId);
  return NextResponse.json({ ok: true });
}
