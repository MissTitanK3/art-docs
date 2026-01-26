export type LoginResponse = {
  token?: string;
  message?: string;
};

export type DispatchPayload = {
  client_id?: string;
  region_id: string; // zip code
  location: { lat: number; lon: number };
  description: string;
  urgency: "low" | "normal" | "high";
};

export type Dispatch = {
  id: string;
  client_id: string;
  region_id: string;
  description: string;
  urgency: "low" | "normal" | "high";
  status: "open" | "acknowledged" | "escalated" | "closed";
  location: { lat: number; lon: number };
  created_at: string;
};

export type ListDispatchesParams = {
  region_id?: string;
  status?: "open" | "acknowledged" | "escalated" | "closed";
  urgency?: "low" | "normal" | "high";
  limit?: number;
  cursor?: string;
};

export type ListDispatchesResponse = {
  data: Dispatch[];
  next_cursor?: string | null;
};

const baseFetch = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return res;
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
  const res = await baseFetch("/api/dispatches", {
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
  if (params.limit) query.set("limit", String(params.limit));
  if (params.cursor) query.set("cursor", params.cursor);
  const res = await baseFetch(`/api/dispatches?${query.toString()}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to fetch dispatches");
  }
  return res.json();
};

export const getDispatch = async (
  id: string,
  token?: string
): Promise<Dispatch> => {
  const res = await baseFetch(`/api/dispatches/${id}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 404) {
    throw new Error("Dispatch not found");
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to fetch dispatch");
  }
  return res.json();
};
