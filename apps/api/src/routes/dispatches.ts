import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/audit.js';

const router: ExpressRouter = Router();

const createDispatchSchema = z.object({
  client_id: z.string().uuid(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    description: z.string().max(256).optional(),
    precision: z.enum(['exact', 'block', 'neighborhood', 'city']).optional().default('block'),
  }),
  description: z.string().max(2000).optional().default(''),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
  submitter_id: z.string().optional(),
  tags: z.array(z.string().max(50)).max(5).optional().default([]),
});

// POST /dispatches
router.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    // Validate input
    let data;
    try {
      data = createDispatchSchema.parse(req.body);
    } catch (validationError) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid input',
        details: validationError instanceof z.ZodError ? validationError.errors : undefined,
      });
      return;
    }

    // Use authenticated user's ID if not provided
    const submitterId = data.submitter_id || req.user?.user_id;

    // Generate dispatch ID - use first 32 chars of timestamp-based ID
    const dispatchId = 'disp-' + Math.random().toString(36).slice(2, 10) + Date.now().toString().slice(-8);

    // Check for existing dispatch with same client_id (idempotency)
    const existing = await db.query('SELECT * FROM dispatches WHERE client_id = $1', [data.client_id]);

    if (existing.rows.length > 0) {
      const dispatch = existing.rows[0];
      res.status(200).json({
        dispatch_id: dispatch.id,
        client_id: dispatch.client_id,
        location: {
          latitude: dispatch.location_lat,
          longitude: dispatch.location_lon,
          description: dispatch.location_description,
          precision: dispatch.location_precision,
        },
        description: dispatch.description,
        urgency: dispatch.urgency,
        status: dispatch.status,
        submitter_id: dispatch.submitter_id,
        tags: dispatch.tags || [],
        responders: [],
        responder_count: 0,
        created_at: dispatch.created_at,
        updated_at: dispatch.updated_at,
        version: dispatch.version,
      });
      return;
    }

    // Create new dispatch
    const result = await db.query(
      `INSERT INTO dispatches 
        (id, client_id, region_id, location_lat, location_lon, location_description, location_precision,
         description, urgency, status, submitter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        dispatchId,
        data.client_id,
        req.user?.regions?.[0] || 'us-west-1',
        data.location.latitude,
        data.location.longitude,
        data.location.description || '',
        data.location.precision,
        data.description,
        data.urgency,
        'open',
        submitterId,
      ],
    );

    const dispatch = result.rows[0];

    // Create audit log entry
    await createAuditLog({
      dispatch_id: dispatch.id,
      region_id: dispatch.region_id,
      event_type: 'dispatch_created',
      actor_id: submitterId,
      after_state: {
        location_lat: dispatch.location_lat,
        location_lon: dispatch.location_lon,
        description: dispatch.description,
        urgency: dispatch.urgency,
        status: dispatch.status,
      },
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    res.status(201).json({
      dispatch_id: dispatch.id,
      client_id: dispatch.client_id,
      location: {
        latitude: dispatch.location_lat,
        longitude: dispatch.location_lon,
        description: dispatch.location_description,
        precision: dispatch.location_precision,
      },
      description: dispatch.description,
      urgency: dispatch.urgency,
      status: dispatch.status,
      submitter_id: dispatch.submitter_id,
      responders: [],
      responder_count: 0,
      created_at: dispatch.created_at,
      updated_at: dispatch.updated_at,
      closed_at: dispatch.closed_at,
      version: dispatch.version,
    });
  } catch (error) {
    next(error);
  }
});

// GET /dispatches
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status?.toString().split(',') || ['open', 'acknowledged'];
    const urgency = req.query.urgency?.toString().split(',');
    const region = req.query.region?.toString() || req.user?.regions[0];
    const limit = Math.min(parseInt(req.query.limit?.toString() || '50'), 100);
    const cursor = req.query.cursor?.toString();
    const includeClosed = req.query.include_closed === 'true';

    let query = `
      SELECT d.*, u.email as submitter_email
      FROM dispatches d
      LEFT JOIN users u ON d.submitter_id = u.id
      WHERE d.is_deleted = false
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Filter by status
    if (!includeClosed) {
      paramCount++;
      query += ` AND d.status = ANY($${paramCount})`;
      params.push(status);
    }

    // Filter by urgency
    if (urgency) {
      paramCount++;
      query += ` AND d.urgency = ANY($${paramCount})`;
      params.push(urgency);
    }

    // Filter by region (if applicable)
    if (region) {
      paramCount++;
      query += ` AND d.region_id = $${paramCount}`;
      params.push(region);
    }

    // Cursor pagination
    if (cursor) {
      paramCount++;
      query += ` AND d.id > $${paramCount}`;
      params.push(cursor);
    }

    query += ` ORDER BY d.created_at DESC, d.id DESC LIMIT $${++paramCount}`;
    params.push(limit + 1); // Fetch one extra to check if has_more

    const result = await db.query(query, params);

    const hasMore = result.rows.length > limit;
    const dispatches = result.rows.slice(0, limit);
    const nextCursor = hasMore ? dispatches[dispatches.length - 1].id : null;

    // Redact PII for unauthenticated users
    const isAuthenticated = !!req.user;

    res.status(200).json({
      dispatches: dispatches.map((d) => ({
        dispatch_id: d.id,
        location: {
          latitude: d.location_lat,
          longitude: d.location_lon,
          description: d.location_description,
          precision: d.location_precision,
        },
        description: d.description,
        urgency: d.urgency,
        status: d.status,
        submitter_id: isAuthenticated ? d.submitter_id : undefined,
        submitter_name: isAuthenticated ? d.submitter_email : 'Anonymous responder',
        responder_count: 0, // TODO: Count from responders table
        created_at: d.created_at,
        updated_at: d.updated_at,
        last_activity: d.updated_at,
      })),
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (error) {
    next(error);
  }
});

// GET /dispatches/:dispatch_id
router.get('/:dispatch_id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { dispatch_id } = req.params;

    const result = await db.query(
      `SELECT d.*, u.email as submitter_email
       FROM dispatches d
       LEFT JOIN users u ON d.submitter_id = u.id
       WHERE d.id = $1 AND d.is_deleted = false`,
      [dispatch_id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Dispatch does not exist',
      });
      return;
    }

    const d = result.rows[0];
    const isAuthenticated = !!req.user;

    // TODO: Fetch responders from responders table
    const responders: unknown[] = [];

    res.status(200).json({
      dispatch_id: d.id,
      location: {
        latitude: d.location_lat,
        longitude: d.location_lon,
        description: d.location_description,
        precision: d.location_precision,
      },
      description: d.description,
      urgency: d.urgency,
      status: d.status,
      submitter_id: isAuthenticated ? d.submitter_id : undefined,
      submitter_name: isAuthenticated ? d.submitter_email : 'Anonymous responder',
      tags: d.tags || [],
      responders,
      responder_count: responders.length,
      created_at: d.created_at,
      updated_at: d.updated_at,
      closed_at: d.closed_at,
      closure_reason: d.closure_reason,
      version: d.version,
    });
  } catch (error) {
    next(error);
  }
});

export { router as dispatchRouter };
