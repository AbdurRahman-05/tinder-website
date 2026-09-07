import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled Server Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.reduce((acc: Record<string, string>, curr) => {
      const key = curr.path.join('.');
      acc[key] = curr.message;
      return acc;
    }, {});
    return sendError(res, 'Validation failed', 422, formattedErrors);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A unique constraint was violated on this field', 409, err.meta);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};
