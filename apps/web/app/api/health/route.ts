import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { runtimeConfig } from "@/config/runtime";
import { getCurrentSubdomain } from "@/lib/subdomain";
import { supabase } from "@/lib/supabase-client";
import { resolveRegion } from "@repo/region";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for Sprint 0
 *
 * Returns:
 * - Environment info (appEnv, siteDomain, subdomain)
 * - Region info (resolved from subdomain or header)
 * - Supabase connectivity status
 * - Timestamp
 */
export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const xRegionHeader = headersList.get("x-region");

  const subdomain = getCurrentSubdomain(host);
  const region = resolveRegion({
    host,
    headerRegion: xRegionHeader,
    fallbackRegion: "DEFAULT",
  });

  // Check Supabase connectivity
  let supabaseStatus: "connected" | "error" = "connected";
  let supabaseMessage = "Connection successful";

  try {
    // Simple connectivity check - attempt to get session
    await supabase.auth.getSession();
  } catch (err) {
    supabaseStatus = "error";
    supabaseMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      appEnv: runtimeConfig.appEnv,
      siteDomain: runtimeConfig.siteDomain,
      subdomain,
    },
    region: {
      detected: region,
      fromHost: host,
      fromHeader: xRegionHeader,
    },
    supabase: {
      status: supabaseStatus,
      message: supabaseMessage,
    },
  });
}
