import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const saveProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Please log in to save profiles', 401);
    }

    const profileId = req.params.id as string;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.status !== 'ACTIVE') {
      return sendError(res, 'Profile not found or no longer active', 404);
    }

    // Save profile idempotently
    const saved = await prisma.savedProfile.upsert({
      where: {
        userId_profileId: {
          userId: req.user.id,
          profileId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        profileId,
      },
    });

    return sendSuccess(res, saved, 'Profile saved to favorites');
  } catch (error) {
    next(error);
  }
};

export const unsaveProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Please log in to manage saved profiles', 401);
    }

    const profileId = req.params.id as string;

    await prisma.savedProfile.deleteMany({
      where: {
        userId: req.user.id,
        profileId,
      },
    });

    return sendSuccess(res, null, 'Profile removed from favorites');
  } catch (error) {
    next(error);
  }
};

export const getSavedProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const saved = await prisma.savedProfile.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    const validProfiles = saved
      .filter((s) => s.profile && s.profile.status === 'ACTIVE' && s.profile.visibility === 'PUBLIC')
      .map((s) => s.profile);

    return sendSuccess(res, validProfiles);
  } catch (error) {
    next(error);
  }
};

export const blockProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Please log in to block profiles', 401);
    }

    const profileId = req.params.id as string;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    if (profile.userId === req.user.id) {
      return sendError(res, 'You cannot block your own profile', 400);
    }

    await prisma.block.upsert({
      where: {
        userId_profileId: {
          userId: req.user.id,
          profileId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        profileId,
      },
    });

    return sendSuccess(res, null, 'Profile has been blocked. They will no longer appear in your discovery results.');
  } catch (error) {
    next(error);
  }
};

export const unblockProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const profileId = req.params.id as string;

    await prisma.block.deleteMany({
      where: {
        userId: req.user.id,
        profileId,
      },
    });

    return sendSuccess(res, null, 'Profile unblocked');
  } catch (error) {
    next(error);
  }
};

export const reportProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileId = req.params.id as string;
    const { reason, description } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    // Check for spam duplicate reports within last 24h from same user or IP
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await prisma.report.findFirst({
      where: {
        profileId,
        createdAt: { gte: twentyFourHoursAgo },
        OR: [
          ...(req.user ? [{ reporterUserId: req.user.id }] : []),
          { reporterIp: ip },
        ],
      },
    });

    if (existingReport) {
      return sendSuccess(
        res,
        null,
        'Thank you. A report for this profile was recently submitted and is already under moderation review.'
      );
    }

    const report = await prisma.report.create({
      data: {
        profileId,
        reporterUserId: req.user ? req.user.id : null,
        reporterIp: ip,
        reason,
        description: description ? description.trim() : null,
        status: 'PENDING',
      },
    });

    return sendSuccess(
      res,
      { reportId: report.id },
      'Thank you. Our moderation team will review this report carefully.',
      201
    );
  } catch (error) {
    next(error);
  }
};
