import { NextRequest, NextResponse } from "next/server";
import { createDispatchSchema, listDispatchesSchema } from "@/lib/validation";
import { extractToken, verifyToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase-client";
import { randomUUID } from "crypto";
import {
  logAPIEvent,
  measureDuration,
  type DispatchCreatedEvent,
  type APIErrorEvent,
} from "@/lib/monitoring";

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
  const timer = measureDuration();
  let userId: string | undefined;
  let regionId: string | undefined;

  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);

    if (!token) {
      logAPIEvent({
        event_type: "api_error",
        timestamp: new Date().toISOString(),
        method: "POST",
        path: "/api/dispatches",
        status_code: 401,
        error: "Missing authentication token",
        error_type: "auth",
        duration_ms: timer.end(),
      } as APIErrorEvent);

      return NextResponse.json(
        {
          error: "Authentication required",
          error_code: "MISSING_TOKEN",
          status_code: 401,
        },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      logAPIEvent({
        event_type: "api_error",
        timestamp: new Date().toISOString(),
        method: "POST",
        path: "/api/dispatches",
        status_code: 401,
        error: "Invalid or expired token",
        error_type: "auth",
        duration_ms: timer.end(),
      } as APIErrorEvent);

      return NextResponse.json(
        {
          error: "Invalid or expired token",
          error_code: "INVALID_TOKEN",
          status_code: 401,
        },
        { status: 401 }
      );
    }

    userId = user.userId;

    const body = await request.json();

    // Validate request body
    const validation = createDispatchSchema.safeParse(body);
    if (!validation.success) {
      logAPIEvent({
        event_type: "api_error",
        timestamp: new Date().toISOString(),
        method: "POST",
        path: "/api/dispatches",
        user_id: userId,
        status_code: 422,
        error: "Validation failed",
        error_type: "validation",
        error_details: validation.error.errors,
        duration_ms: timer.end(),
      } as APIErrorEvent);

      return NextResponse.json(
        {
          error: "Invalid request",
          error_code: "VALIDATION_ERROR",
          status_code: 422,
          details: validation.error.errors,
        },
        { status: 422 }
      );
    }

    const { region_id, client_id, location, description, urgency } =
      validation.data;

    const radiusMeters =
      location.precision === "neighborhood"
        ? (location.radius_meters ?? null)
        : null;
    regionId = region_id;

    // Check if user has access to this region (zip code)
    if (!user.allowedRegions.includes(region_id)) {
      logAPIEvent({
        event_type: "api_error",
        timestamp: new Date().toISOString(),
        method: "POST",
        path: "/api/dispatches",
        user_id: userId,
        region_id: regionId,
        status_code: 403,
        error: `Access denied to region ${region_id}`,
        error_type: "auth",
        duration_ms: timer.end(),
      } as APIErrorEvent);

      return NextResponse.json(
        {
          error: "Access denied to this region",
          error_code: "REGION_ACCESS_DENIED",
          status_code: 403,
        },
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
        .select("id, region_id, status, created_at, location_radius_meters")
        .eq("client_id", client_id)
        .eq("region_id", region_id)
        .single();

      if (existing) {
        // Log idempotent request
        logAPIEvent({
          event_type: "dispatch_created",
          timestamp: new Date().toISOString(),
          method: "POST",
          path: "/api/dispatches",
          user_id: userId,
          region_id: regionId,
          dispatch_id: existing.id,
          urgency: urgency,
          location_precision: location.precision,
          idempotent: true,
          status_code: 200,
          duration_ms: timer.end(),
        } as DispatchCreatedEvent);

        // Return existing dispatch (idempotent response)
        return NextResponse.json(
          {
            dispatch_id: existing.id,
            region_id: existing.region_id,
            status: existing.status,
            created_at: existing.created_at,
            location_radius_meters: existing.location_radius_meters,
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
        location_radius_meters: radiusMeters,
        description,
        urgency,
        status: "open",
        version: 1,
      })
      .select("id, region_id, status, created_at, location_radius_meters")
      .single();

    if (dispatchError) {
      console.error("Dispatch creation error:", dispatchError);

      logAPIEvent({
        event_type: "api_error",
        timestamp: new Date().toISOString(),
        method: "POST",
        path: "/api/dispatches",
        user_id: userId,
        region_id: regionId,
        status_code: 500,
        error: "Database error during dispatch creation",
        error_type: "database",
        error_details: dispatchError,
        duration_ms: timer.end(),
      } as APIErrorEvent);

      return NextResponse.json(
        {
          error: "Failed to create dispatch",
          error_code: "DATABASE_ERROR",
          status_code: 500,
        },
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
        location_radius_meters: radiusMeters,
      },
      changed_fields: [
        "id",
        "status",
        "urgency",
        "region_id",
        "location_radius_meters",
      ],
    });

    // Log successful dispatch creation
    logAPIEvent({
      event_type: "dispatch_created",
      timestamp: new Date().toISOString(),
      method: "POST",
      path: "/api/dispatches",
      user_id: userId,
      region_id: regionId,
      dispatch_id: dispatchId,
      urgency,
      location_precision: location.precision,
      idempotent: false,
      status_code: 201,
      duration_ms: timer.end(),
    } as DispatchCreatedEvent);

    return NextResponse.json(
      {
        dispatch_id: dispatch.id,
        region_id: dispatch.region_id,
        status: dispatch.status,
        created_at: dispatch.created_at,
        location_radius_meters: dispatch.location_radius_meters,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Dispatch creation error:", error);

    logAPIEvent({
      event_type: "api_error",
      timestamp: new Date().toISOString(),
      method: "POST",
      path: "/api/dispatches",
      user_id: userId,
      region_id: regionId,
      status_code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
      error_type: "internal",
      duration_ms: timer.end(),
    } as APIErrorEvent);

    return NextResponse.json(
      {
        error: "Internal server error",
        error_code: "INTERNAL_ERROR",
        status_code: 500,
      },
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

    const validation = listDispatchesSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { region_id, status, urgency, active, limit, offset } =
      validation.data;

    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value || null;
    const token = extractToken(authHeader, cookieToken);
    const user = token ? verifyToken(token) : null;

    const activeStatuses = ["open", "acknowledged", "escalated", "reopened"];

    let query = supabase
      .from("dispatches")
      .select(
        "id, region_id, location_lat, location_lon, location_description, location_precision, location_radius_meters, description, urgency, status, created_at, updated_at",
        { count: "exact" }
      )
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (region_id) {
      query = query.eq("region_id", region_id);
    }
    if (typeof active === "boolean") {
      if (active) {
        query = query.in("status", activeStatuses);
      } else {
        const inactiveSet = `(${activeStatuses.map((s) => `"${s}"`).join(",")})`;
        query = query.not("status", "in", inactiveSet);
      }
    } else if (status) {
      query = query.eq("status", status);
    }
    if (urgency) {
      query = query.eq("urgency", urgency);
    }

    const { data: dispatches, error, count } = await query;

    if (error) {
      console.error("Dispatch query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch dispatches" },
        { status: 500 }
      );
    }

    const statusDisplay = (rawStatus: string) => {
      if (
        ["open", "acknowledged", "escalated", "reopened"].includes(rawStatus)
      ) {
        return rawStatus === "acknowledged" ? "Pending" : "Active";
      }
      if (rawStatus === "closed") return "Closed";
      if (rawStatus === "cancelled") return "Cancelled";
      return "Active";
    };

    const sanitizedDispatches = dispatches?.map((dispatch) => {
      const base = {
        ...dispatch,
        status_display: statusDisplay(dispatch.status),
        updated_at: dispatch.updated_at ?? dispatch.created_at,
      };

      if (!user) {
        return {
          ...base,
          location_lat: Number(dispatch.location_lat.toFixed(2)),
          location_lon: Number(dispatch.location_lon.toFixed(2)),
          description: null,
          location_description: dispatch.location_description,
        };
      }

      return base;
    });

    const total = count ?? sanitizedDispatches?.length ?? 0;
    const nextOffset = offset + limit;
    const hasMore = total > nextOffset;
    const prevOffset = Math.max(offset - limit, 0);

    return NextResponse.json({
      dispatches: sanitizedDispatches,
      pagination: {
        limit,
        offset,
        next_offset: hasMore ? nextOffset : null,
        prev_offset: offset > 0 ? prevOffset : null,
        has_more: hasMore,
        total,
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
