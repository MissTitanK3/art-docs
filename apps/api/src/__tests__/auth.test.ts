import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from '../routes/auth.js';
import { db } from '../lib/db.js';
import bcrypt from 'bcrypt';

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

describe('Authentication Endpoints', () => {
  let testUserId: string;
  let testUserEmail: string;
  let testUserPassword: string;

  beforeAll(async () => {
    // Create a test user
    testUserId = 'test-user-' + Date.now();
    testUserEmail = `test-${Date.now()}@example.com`;
    testUserPassword = 'Test123!@#';
    const passwordHash = await bcrypt.hash(testUserPassword, 10);

    await db.query(
      `INSERT INTO users (id, email, password_hash, role, allowed_regions) 
       VALUES ($1, $2, $3, $4, $5)`,
      [testUserId, testUserEmail, passwordHash, 'responder', JSON.stringify(['us-west-1'])],
    );
  });

  afterAll(async () => {
    // Clean up test user
    await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    // Note: pg pool cleanup is handled by the test framework
  });

  describe('POST /auth/login', () => {
    it('should return 200 with token for valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user_id');
      expect(response.body.email).toBe(testUserEmail);
      expect(response.body.role).toBe('responder');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'wrong-password',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'any-password',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 400 for missing email', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          password: testUserPassword,
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
        })
        .expect(400);
    });

    it('should return 403 for unauthorized region', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
          region_id: 'us-east-1', // User only has access to us-west-1
        })
        .expect(403);

      expect(response.body.error).toBe('Forbidden');
    });
  });

  describe('GET /auth/session', () => {
    it('should return 401 without authentication', async () => {
      await request(app).get('/auth/session').expect(401);
    });

    it('should return user data with valid session', async () => {
      // First login to get token
      const loginResponse = await request(app).post('/auth/login').send({
        email: testUserEmail,
        password: testUserPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Then check session
      const response = await request(app).get('/auth/session').set('Cookie', cookies!).expect(200);

      expect(response.body.user_id).toBe(testUserId);
      expect(response.body.email).toBe(testUserEmail);
      expect(response.body.role).toBe('responder');
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 401 without authentication', async () => {
      await request(app).post('/auth/logout').expect(401);
    });

    it('should clear session cookie', async () => {
      // First login to get token
      const loginResponse = await request(app).post('/auth/login').send({
        email: testUserEmail,
        password: testUserPassword,
      });

      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Then logout
      const response = await request(app).post('/auth/logout').set('Cookie', cookies!).expect(200);

      expect(response.body.message).toBe('Logged out successfully');

      // Check that cookie is cleared (Express clears cookies by setting Expires in the past)
      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader![0]).toContain('Expires=Thu, 01 Jan 1970');
    });
  });
});
