import { z } from "zod";

/**
 * Validation schema for POST /api/auth/login
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Validation schema for POST /api/auth/register
 * Note: Only responder and viewer roles are allowed for self-registration.
 * Admin accounts must be created by existing administrators.
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["responder", "viewer"]).default("responder"),
  allowed_regions: z
    .array(z.string().regex(/^\d{5}$/i, "Zip codes must be 5 digits"))
    .default([]),
});

/**
 * Validation schema for POST /api/dispatches
 */
export const createDispatchSchema = z.object({
  region_id: z
    .string()
    .regex(/^\d{5}$/, "region_id must be a 5-digit zip code"),
  client_id: z.string().uuid("client_id must be a valid UUID").optional(),
  location: z.object({
    lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    lon: z
      .number()
      .min(-180)
      .max(180, "Longitude must be between -180 and 180"),
    description: z.string().max(256).optional(),
    precision: z
      .enum(["exact", "block", "neighborhood", "city"])
      .default("block"),
  }),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  urgency: z.enum(["low", "normal", "critical"]).default("normal"),
});

/**
 * Validation schema for GET /api/dispatches query params
 */
export const listDispatchesSchema = z.object({
  region_id: z.string().optional(),
  status: z
    .enum(["open", "acknowledged", "escalated", "closed", "reopened"])
    .optional(),
  urgency: z.enum(["low", "normal", "critical"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(), // ISO 8601 timestamp
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
export type ListDispatchesInput = z.infer<typeof listDispatchesSchema>;
