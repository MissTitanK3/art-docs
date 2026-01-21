import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env FIRST, before any other imports that use env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { dispatchRouter } from './routes/dispatches.js';
import { errorHandler } from './middleware/errorHandler.js';
import { db } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

// Routes
app.use('/auth', authRouter);
app.use('/dispatches', dispatchRouter);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
