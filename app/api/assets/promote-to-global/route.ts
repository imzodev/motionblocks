import { NextResponse } from "next/server";
import { assetService } from "@/lib/server/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, assetId, name, description, whenToUse, tags } = body as {
      projectId: string;
      assetId: string;
      name: string;
      description?: string;
      whenToUse?: string;
      tags?: string[];
    };

    if (!projectId || !assetId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, assetId, name" },
        { status: 400 }
      );
    }

    const asset = await assetService.promoteToGlobal(projectId, assetId, {
      name,
      description,
      whenToUse,
      tags,
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found or not a project asset" },
        { status: 404 }
      );
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("/api/assets/promote-to-global POST failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Promote failed", message }, { status: 500 });
  }
}
