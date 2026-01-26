import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { generateToken, hashPassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase-client";

export const dynamic = "force-dynamic";

function createUserId() {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return `usr_${raw.slice(0, 16)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, role, allowed_regions } = validation.data;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);
    const id = createUserId();

    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({ id, email, password_hash, role, allowed_regions })
      .select("id, email, role, allowed_regions")
      .single();

    if (insertError || !insertedUser) {
      console.error("Register insert error:", insertError);
      return NextResponse.json(
        { error: "Unable to create account" },
        { status: 500 }
      );
    }

    const token = generateToken({
      userId: insertedUser.id,
      email: insertedUser.email,
      role: insertedUser.role,
      allowedRegions: insertedUser.allowed_regions as string[],
    });

    const response = NextResponse.json(
      {
        token,
        user: insertedUser,
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
