import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { extractToken, verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Extract JWT token from Authorization header or cookie
    const authHeader = request.headers.get("Authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);

    let userId: string | null = null;
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId;
        }
      } catch {
        // Token invalid or expired, treat as unauthenticated
      }
    }

    // Fetch dispatch by ID
    const { data: dispatch, error } = await supabase
      .from("dispatches")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !dispatch) {
      return NextResponse.json(
        { error: "Dispatch not found" },
        { status: 404 }
      );
    }

    const statusDisplay = [
      "open",
      "acknowledged",
      "escalated",
      "reopened",
    ].includes(dispatch.status)
      ? dispatch.status === "acknowledged"
        ? "Pending"
        : "Active"
      : dispatch.status === "closed"
        ? "Closed"
        : "Cancelled";

    if (!userId) {
      dispatch.description = null;
      dispatch.location_description = null;
    }

    return NextResponse.json(
      {
        ...dispatch,
        status_display: statusDisplay,
        updated_at: dispatch.updated_at ?? dispatch.created_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dispatch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
