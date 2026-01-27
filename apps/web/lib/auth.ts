import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret - MUST be set in production
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required in production. " +
      "Generate a secure secret: openssl rand -base64 32"
  );
}

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const JWT_EXPIRY = "1h";

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
 * Cost factor: 12 (recommended for production security)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
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

/**
 * Check if token is expiring within the given minutes
 * Used to determine if token refresh is needed
 */
export function isTokenExpiringSoon(
  token: string,
  withinMinutes: number = 5
): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return true; // Invalid token, needs refresh
    }

    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    const thresholdMs = withinMinutes * 60 * 1000;

    return timeUntilExpiry < thresholdMs;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true; // On error, assume needs refresh
  }
}

/**
 * Get token expiry time in ISO format
 */
export function getTokenExpiry(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000).toISOString();
  } catch (error) {
    return null;
  }
}
