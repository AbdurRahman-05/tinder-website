import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, dateOfBirth } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      res,
      {
        user,
        accessToken,
        refreshToken,
        hasProfile: false,
        dateOfBirthVerified: true,
      },
      'Registration successful! Welcome to PRISM.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            visibility: true,
            status: true,
            isVerified: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account has been suspended by administration', 403);
    }

    if (user.status === 'DELETED') {
      return sendError(res, 'This account has been deleted', 401);
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        profile: user.profile,
        hasProfile: Boolean(user.profile),
        accessToken,
        refreshToken,
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return sendError(res, 'Refresh token required', 400);
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return sendError(res, 'User inactive or not found', 401);
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: {
          include: {
            photos: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      hasProfile: Boolean(user.profile),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    // Soft delete user and profile
    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      }),
      prisma.profile.updateMany({
        where: { userId: req.user.id },
        data: {
          status: 'DELETED',
          visibility: 'HIDDEN',
          deletedAt: new Date(),
        },
      }),
    ]);

    return sendSuccess(res, null, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};
