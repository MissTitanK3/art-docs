import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { generateToken, isTokenExpiringSoon, JWTPayload } from '../lib/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router: ExpressRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  region_id: z.string().optional(),
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    // Validate input
    let validatedData;
    try {
      validatedData = loginSchema.parse(req.body);
    } catch (validationError) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid input',
        details: validationError instanceof z.ZodError ? validationError.errors : undefined,
      });
      return;
    }

    const { email, password, region_id } = validatedData;

    // Query user by email
    const result = await db.query(
      'SELECT id, email, password_hash, role, allowed_regions, created_at FROM users WHERE email = $1 AND is_active = true',
      [email],
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
      return;
    }

    // Check region authorization if region_id provided
    if (region_id && !user.allowed_regions?.includes(region_id)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'User not authorized for requested region',
      });
      return;
    }

    // Generate JWT
    const payload: JWTPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      regions: user.allowed_regions || [],
    };

    const token = generateToken(payload);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Set HttpOnly cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour in ms
    });

    res.status(200).json({
      user_id: user.id,
      email: user.email,
      role: user.role,
      regions: user.allowed_regions || [],
      token,
      expires_at: expiresAt.toISOString(),
      created_at: user.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('session');
  res.status(200).json({
    message: 'Logged out successfully',
  });
});

// GET /auth/session
router.get('/session', authenticate, (req: AuthRequest, res) => {
  const currentToken = req.cookies?.session || req.headers.authorization?.slice(7);

  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No valid session',
    });
    return;
  }

  const response: Record<string, unknown> = {
    user_id: req.user.user_id,
    email: req.user.email,
    role: req.user.role,
    regions: req.user.regions,
  };

  // Refresh token if expiring soon
  if (currentToken && isTokenExpiringSoon(currentToken, 5)) {
    const newToken = generateToken(req.user);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    res.cookie('session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    response.token = newToken;
    response.expires_at = expiresAt.toISOString();
  }

  res.status(200).json(response);
});

export { router as authRouter };
