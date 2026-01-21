import { NextRequest, NextResponse } from "next/server";
import { createToken, setAdminCookie } from "@/lib/auth";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "@/lib/constants";
import { LoginRequest, LoginResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body: LoginRequest = await request.json();

    if (!body.username || !body.password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Simple credential check
    if (body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken(body.username);

    // Create response
    const response = NextResponse.json(
      { success: true, token },
      { status: 200 }
    );

    // Set cookie
    await setAdminCookie(token);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
