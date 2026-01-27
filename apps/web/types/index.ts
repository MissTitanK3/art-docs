export type UserRole = "responder" | "admin" | "viewer";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  allowed_regions?: string[]; // zip codes
};

export type Location = { lat: number; lon: number };

export type DispatchStatus = "open" | "acknowledged" | "escalated" | "closed";
export type DispatchUrgency = "low" | "normal" | "critical";

export type Dispatch = {
  id: string;
  client_id: string;
  region_id: string;
  description: string;
  urgency: DispatchUrgency;
  status: DispatchStatus;
  location: Location;
  created_at: string;
};

export type Paginated<T> = {
  data: T[];
  next_cursor?: string | null;
};
