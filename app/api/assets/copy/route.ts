import { NextResponse } from "next/server";
import { assetService } from "@/lib/server/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromProjectId, toProjectId, assetIds } = body as {
      fromProjectId: string;
      toProjectId: string;
      assetIds: string[];
    };

    if (!fromProjectId || !toProjectId || !Array.isArray(assetIds)) {
      return NextResponse.json(
        { error: "Missing required fields: fromProjectId, toProjectId, assetIds" },
        { status: 400 }
      );
    }

    const results = await assetService.copyProjectAssets(fromProjectId, toProjectId, assetIds);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("/api/assets/copy POST failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Copy failed", message }, { status: 500 });
  }
}
