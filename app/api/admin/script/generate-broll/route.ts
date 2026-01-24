import { NextRequest, NextResponse } from "next/server";
import { generateBRollPlan } from "@/lib/server/script/broll-generator";
import type { VideoScript } from "@/lib/admin/script-types";

export async function POST(request: NextRequest) {
  try {
    const body: { script: VideoScript } = await request.json();

    if (!body.script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const plan = await generateBRollPlan(body.script);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("B-roll generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate B-roll plan" },
      { status: 500 }
    );
  }
}
