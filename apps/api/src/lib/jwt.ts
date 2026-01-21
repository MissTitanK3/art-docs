import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '1h';

export interface JWTPayload {
  user_id: string;
  email: string;
  role: 'responder' | 'admin' | 'viewer';
  regions: string[];
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
    return null;
  }
  return new Date((decoded as { exp: number }).exp * 1000);
}

export function isTokenExpiringSoon(token: string, withinMinutes: number = 5): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;

  const now = new Date();
  const timeUntilExpiry = expiry.getTime() - now.getTime();
  return timeUntilExpiry < withinMinutes * 60 * 1000;
}
