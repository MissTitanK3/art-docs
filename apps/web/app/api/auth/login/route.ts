import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { comparePassword, generateToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase-client";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 *
 * Authenticates a user with email and password
 * Returns JWT token on success
 *
 * Sprint 0.5 Phase B Task #5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Query user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash, role, allowed_regions, is_active")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last_login_at
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      allowedRegions: user.allowed_regions as string[],
    });

    // Create response with token in both body and HTTP-only cookie
    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          allowed_regions: user.allowed_regions,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie (more secure than localStorage)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
