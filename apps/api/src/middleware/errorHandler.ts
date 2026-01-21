import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      details: err.errors,
    });
    return;
  }

  if ('statusCode' in err && typeof err.statusCode === 'number') {
    res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}
