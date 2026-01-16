import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/server/admin/auth";
import { generateScript } from "@/lib/server/script";
import type { GenerateScriptRequest } from "@/lib/admin/script-types";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GenerateScriptRequest = await request.json();

    if (!body.input?.topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const result = await generateScript(body.input, body.settings);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate script" },
      { status: 500 }
    );
  }
}
