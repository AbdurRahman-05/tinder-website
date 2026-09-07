import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;

    try {
      decoded = verifyAccessToken(token);
    } catch {
      return sendError(res, 'Session expired or invalid. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account has been suspended by administration', 403);
    }

    if (user.status === 'DELETED') {
      return sendError(res, 'This account has been deleted', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true, status: true },
        });
        if (user && user.status === 'ACTIVE') {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        }
      } catch {
        // Ignore token errors for optionalAuth
      }
    }
    next();
  } catch {
    next();
  }
};
