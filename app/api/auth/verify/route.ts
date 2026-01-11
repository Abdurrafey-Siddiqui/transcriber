import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { authenticated: true, email: payload.email },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
