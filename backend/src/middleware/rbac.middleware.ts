import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';

const roleHierarchy: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MODERATOR: 2,
  USER: 1,
};

export const requireRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access', 401);
    }

    const userRole = (req.user.role as Role) || 'USER';
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return sendError(res, 'Forbidden: Insufficient privileges for this action', 403);
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireSuperAdmin = requireRole('SUPER_ADMIN');
export const requireModerator = requireRole('MODERATOR');
