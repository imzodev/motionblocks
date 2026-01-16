import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/server/admin/auth";
import { extractContentFromUrl } from "@/lib/server/script/url-extractor";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const content = await extractContentFromUrl(url);

    return NextResponse.json(content);
  } catch (error) {
    console.error("URL extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract content" },
      { status: 500 }
    );
  }
}
