import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret - in production, this should be from env var
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "24h";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  allowedRegions: string[];
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: "dispatch-system",
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "dispatch-system",
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract JWT token from Authorization header or cookies
 */
export function extractToken(
  authHeader: string | null,
  cookieToken: string | null
): string | null {
  // Try Authorization header first (Bearer token)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Fall back to cookie
  return cookieToken;
}
