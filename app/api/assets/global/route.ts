import { NextResponse } from "next/server";
import { assetService } from "@/lib/server/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const assets = await assetService.listGlobalAssets();
    return NextResponse.json({ assets });
  } catch (error) {
    console.error("/api/assets/global GET failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to list global assets", message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as { assetIds?: string[] };
    const assetIds = Array.isArray(body.assetIds) ? body.assetIds.filter((id) => typeof id === "string") : [];

    if (assetIds.length === 0) {
      return NextResponse.json({ error: "Missing assetIds" }, { status: 400 });
    }

    const result = await assetService.deleteGlobalAssets(assetIds);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("/api/assets/global DELETE failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Bulk delete failed", message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const whenToUse = formData.get("whenToUse") as string | null;
    const tagsRaw = formData.get("tags") as string | null;

    let tags: string[] | undefined;
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw);
      } catch {
        tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const asset = await assetService.uploadGlobalFile(file, {
      name: name ?? undefined,
      description: description ?? undefined,
      whenToUse: whenToUse ?? undefined,
      tags,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("/api/assets/global POST failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Upload failed", message }, { status: 500 });
  }
}
