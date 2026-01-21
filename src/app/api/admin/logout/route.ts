import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/auth";
import { LoginResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    await clearAdminCookie();

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
