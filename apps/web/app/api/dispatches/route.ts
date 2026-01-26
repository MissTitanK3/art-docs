import { NextRequest, NextResponse } from "next/server";
import { createDispatchSchema, listDispatchesSchema } from "@/lib/validation";
import { extractToken, verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase-client";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/dispatches
 *
 * Creates a new dispatch with idempotency support
 * Requires authentication
 *
 * Sprint 0.5 Phase B Task #6
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createDispatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 422 }
      );
    }

    const { region_id, client_id, location, description, urgency } =
      validation.data;

    // Check if user has access to this region (zip code)
    if (!user.allowedRegions.includes(region_id)) {
      return NextResponse.json(
        { error: "Access denied to this region" },
        { status: 403 }
      );
    }

    // Generate dispatch ID
    const dispatchId = `dsp_${randomUUID().replace(/-/g, "").substring(0, 12)}`;
    const idempotencyKey = client_id || randomUUID();

    // Check for existing dispatch with same client_id (idempotency)
    if (client_id) {
      const { data: existing } = await supabase
        .from("dispatches")
        .select("id, region_id, status, created_at")
        .eq("client_id", client_id)
        .eq("region_id", region_id)
        .single();

      if (existing) {
        // Return existing dispatch (idempotent response)
        return NextResponse.json(
          {
            dispatch_id: existing.id,
            region_id: existing.region_id,
            status: existing.status,
            created_at: existing.created_at,
            idempotent: true,
          },
          { status: 200 }
        );
      }
    }

    // Insert new dispatch
    const { data: dispatch, error: dispatchError } = await supabase
      .from("dispatches")
      .insert({
        id: dispatchId,
        region_id,
        submitter_id: user.userId,
        client_id: idempotencyKey,
        location_lat: location.lat,
        location_lon: location.lon,
        location_description: location.description,
        location_precision: location.precision,
        description,
        urgency,
        status: "open",
        version: 1,
      })
      .select("id, region_id, status, created_at")
      .single();

    if (dispatchError) {
      console.error("Dispatch creation error:", dispatchError);
      return NextResponse.json(
        { error: "Failed to create dispatch" },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase.from("audit_log").insert({
      dispatch_id: dispatchId,
      region_id,
      event_type: "dispatch_created",
      actor_id: user.userId,
      before_state: null,
      after_state: {
        id: dispatchId,
        status: "open",
        urgency,
        region_id,
      },
      changed_fields: ["id", "status", "urgency", "region_id"],
    });

    return NextResponse.json(
      {
        dispatch_id: dispatch.id,
        region_id: dispatch.region_id,
        status: dispatch.status,
        created_at: dispatch.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Dispatch creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dispatches
 *
 * Lists dispatches with pagination and filtering
 * Public endpoint (with PII redaction for unauthenticated users)
 *
 * Sprint 0.5 Phase B Task #7
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = listDispatchesSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { region_id, status, urgency, limit, cursor } = validation.data;

    // Check if user is authenticated
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);
    const user = token ? verifyToken(token) : null;

    // Build query
    let query = supabase
      .from("dispatches")
      .select(
        "id, region_id, location_lat, location_lon, location_description, location_precision, description, urgency, status, created_at, updated_at"
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filters
    if (region_id) {
      query = query.eq("region_id", region_id);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (urgency) {
      query = query.eq("urgency", urgency);
    }

    // Apply cursor pagination
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: dispatches, error } = await query;

    if (error) {
      console.error("Dispatch query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch dispatches" },
        { status: 500 }
      );
    }

    // PII redaction for unauthenticated users
    const sanitizedDispatches = dispatches?.map((dispatch) => {
      if (!user) {
        // Redact PII for unauthenticated users
        return {
          id: dispatch.id,
          region_id: dispatch.region_id,
          location_lat: Number(dispatch.location_lat.toFixed(2)), // Reduce precision
          location_lon: Number(dispatch.location_lon.toFixed(2)), // Reduce precision
          location_description: dispatch.location_description,
          location_precision: dispatch.location_precision,
          description: null, // Redact description
          urgency: dispatch.urgency,
          status: dispatch.status,
          created_at: dispatch.created_at,
        };
      }
      return dispatch;
    });

    // Generate next cursor
    const nextCursor =
      sanitizedDispatches && sanitizedDispatches.length === limit
        ? sanitizedDispatches[sanitizedDispatches.length - 1]?.created_at
        : null;

    return NextResponse.json({
      dispatches: sanitizedDispatches,
      pagination: {
        limit,
        cursor: cursor || null,
        next_cursor: nextCursor,
        has_more: nextCursor !== null,
      },
    });
  } catch (error) {
    console.error("Dispatch list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
