import { runtimeConfig } from "@/config/runtime";
export type LoginResponse = {
  token?: string;
  message?: string;
};

export type DispatchPayload = {
  client_id?: string;
  region_id: string; // zip code
  location: { lat: number; lon: number };
  description: string;
  urgency: "low" | "normal" | "critical";
};

export type Dispatch = {
  id: string;
  client_id: string;
  region_id: string;
  description: string;
  urgency: "low" | "normal" | "critical";
  status:
    | "open"
    | "acknowledged"
    | "escalated"
    | "closed"
    | "reopened"
    | "cancelled";
  location: { lat: number; lon: number };
  location_description?: string | null;
  location_precision?: string | null;
  created_at: string;
  updated_at?: string;
  status_display?: string;
};

export type ListDispatchesParams = {
  region_id?: string;
  status?:
    | "open"
    | "acknowledged"
    | "escalated"
    | "closed"
    | "reopened"
    | "cancelled";
  urgency?: "low" | "normal" | "critical";
  active?: boolean;
  limit?: number;
  offset?: number;
};

export type ListDispatchesResponse = {
  data: Dispatch[];
  pagination: {
    limit: number;
    offset: number;
    next_offset: number | null;
    prev_offset: number | null;
    has_more: boolean;
    total: number;
  };
};

const baseFetch = async (path: string, init: RequestInit = {}) => {
  const configuredBase = runtimeConfig.apiBaseUrl?.replace(/\/$/, "");
  const hasConfiguredBase = Boolean(configuredBase);

  // Prefer runtime-configured base; fall back to same-origin /api to avoid connection refusals in local dev
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const relativePath = normalizedPath.startsWith("/api")
    ? normalizedPath
    : `/api${normalizedPath}`;

  const primaryUrl = path.startsWith("http")
    ? path
    : hasConfiguredBase
      ? `${configuredBase}${normalizedPath}`
      : relativePath;

  const fallbackUrl = relativePath;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  console.log(
    `[baseFetch] Fetching from: ${primaryUrl}${primaryUrl !== fallbackUrl ? ` (fallback: ${fallbackUrl})` : ""}`
  );

  try {
    const res = await fetch(primaryUrl, {
      ...init,
      credentials: "include",
      headers: defaultHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log(`[baseFetch] Response from ${primaryUrl}: ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    // If primary URL fails and it's different from fallback, try fallback
    if (primaryUrl !== fallbackUrl) {
      console.warn(
        `[baseFetch] Primary URL failed (${primaryUrl}), trying fallback (${fallbackUrl}):`,
        err instanceof Error ? err.message : err
      );
      try {
        const res = await fetch(fallbackUrl, {
          ...init,
          credentials: "include",
          headers: defaultHeaders,
        });
        console.log(
          `[baseFetch] Response from fallback ${fallbackUrl}: ${res.status}`
        );
        return res;
      } catch (fallbackErr) {
        console.error(
          `[baseFetch] Fallback URL also failed (${fallbackUrl}):`,
          fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
        );
        throw fallbackErr;
      }
    }
    throw err;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await baseFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Login failed");
  }
  return res.json();
};

export const postDispatch = async (
  payload: DispatchPayload,
  token?: string
): Promise<Dispatch> => {
  const withClientId = {
    client_id:
      payload.client_id || globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
    ...payload,
  };
  const res = await baseFetch("/dispatches", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(withClientId),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to create dispatch");
  }
  return res.json();
};

export const listDispatches = async (
  params: ListDispatchesParams = {},
  token?: string
): Promise<ListDispatchesResponse> => {
  const query = new URLSearchParams();
  if (params.region_id) query.set("region_id", params.region_id);
  if (params.status) query.set("status", params.status);
  if (params.urgency) query.set("urgency", params.urgency);
  if (typeof params.active === "boolean")
    query.set("active", String(params.active));
  query.set("limit", String(params.limit ?? 20));
  query.set("offset", String(params.offset ?? 0));
  const res = await baseFetch(`/dispatches?${query.toString()}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to fetch dispatches");
  }
  const json = await res.json();
  const mapDispatch = (d: any): Dispatch => ({
    id: d.id,
    client_id: d.client_id ?? "",
    region_id: d.region_id,
    description: d.description ?? "",
    urgency: d.urgency,
    status: d.status,
    status_display: d.status_display,
    location: d.location ?? { lat: d.location_lat, lon: d.location_lon },
    location_description: d.location_description,
    location_precision: d.location_precision,
    created_at: d.created_at,
    updated_at: d.updated_at,
  });

  return {
    data: Array.isArray(json.dispatches)
      ? json.dispatches.map(mapDispatch)
      : [],
    pagination: json.pagination,
  };
};

export const getDispatch = async (
  id: string,
  token?: string
): Promise<Dispatch> => {
  try {
    console.log(
      `[getDispatch] Fetching dispatch with id: ${id}, token: ${token ? "present" : "absent"}`
    );

    const res = await baseFetch(`/dispatches/${id}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`[getDispatch] Response status: ${res.status}`);

    if (res.status === 404) {
      throw new Error("Dispatch not found");
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `[getDispatch] API error (${res.status}):`,
        errText.substring(0, 500)
      );
      throw new Error(errText || "Failed to fetch dispatch");
    }

    let d;
    try {
      d = await res.json();
    } catch (parseErr) {
      const text = await res.clone().text();
      console.error(
        "[getDispatch] Failed to parse JSON response:",
        text.substring(0, 500)
      );
      throw new Error(
        `Invalid JSON response: ${parseErr instanceof Error ? parseErr.message : parseErr}`
      );
    }

    console.log("[getDispatch] Raw response:", d);

    if (!d.id || !d.region_id) {
      console.error(
        "[getDispatch] Invalid dispatch object (missing id or region_id):",
        d
      );
      throw new Error("Invalid dispatch data: missing required fields");
    }

    const mapped: Dispatch = {
      id: d.id,
      client_id: d.client_id ?? "",
      region_id: d.region_id,
      description: d.description ?? "",
      urgency: d.urgency,
      status: d.status,
      status_display: d.status_display,
      location: d.location ?? { lat: d.location_lat, lon: d.location_lon },
      location_description: d.location_description,
      location_precision: d.location_precision,
      created_at: d.created_at,
      updated_at: d.updated_at,
    };

    console.log("[getDispatch] Mapped dispatch:", mapped);
    return mapped;
  } catch (err) {
    console.error(
      "[getDispatch] Caught error:",
      err instanceof Error ? err.message : err
    );
    throw err;
  }
};
