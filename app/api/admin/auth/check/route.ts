import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/server/admin/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;

  if (!token || !isValidSessionToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
