import { NextRequest, NextResponse } from "next/server";
import {
  extractToken,
  verifyToken,
  generateToken,
  isTokenExpiringSoon,
  getTokenExpiry,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 *
 * Check session health and refresh token if needed
 * - Validates current JWT token
 * - Returns user info
 * - If token expires within 5 minutes, generates new token
 * - Frontend should call this every 15 minutes to keep session alive
 *
 * Sprint 1 Token Refresh Implementation
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify current token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if token is expiring soon (within 5 minutes)
    const needsRefresh = isTokenExpiringSoon(token, 5);

    let newToken: string | undefined;
    let response: NextResponse;

    if (needsRefresh) {
      // Generate new token with same payload
      newToken = generateToken({
        userId: user.userId,
        email: user.email,
        role: user.role,
        allowedRegions: user.allowedRegions,
      });

      response = NextResponse.json(
        {
          user: {
            id: user.userId,
            email: user.email,
            role: user.role,
            allowed_regions: user.allowedRegions,
          },
          token: newToken,
          expires_at: getTokenExpiry(newToken),
          refreshed: true,
        },
        { status: 200 }
      );

      // Set new HTTP-only cookie
      response.cookies.set("auth_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });
    } else {
      // Token still valid, no refresh needed
      response = NextResponse.json(
        {
          user: {
            id: user.userId,
            email: user.email,
            role: user.role,
            allowed_regions: user.allowedRegions,
          },
          expires_at: getTokenExpiry(token),
          refreshed: false,
        },
        { status: 200 }
      );
    }

    return response;
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
