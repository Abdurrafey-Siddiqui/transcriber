import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify credentials
    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await generateToken(email);

    // Create response with cookie
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    // Set HTTP-only cookie with JWT
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
