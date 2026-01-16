import { NextRequest, NextResponse } from "next/server";
import { createAdminAuthService, generateSessionToken } from "@/lib/server/admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const authService = createAdminAuthService();
    const result = authService.authenticate({ username, password });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = generateSessionToken();

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
