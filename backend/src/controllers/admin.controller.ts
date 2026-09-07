import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { calculateAge } from '../validators/auth.validator';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProfiles,
      activeProfiles,
      hiddenProfiles,
      blockedProfiles,
      pendingReports,
      newUsersToday,
      newProfilesToday,
      genderGroups,
      allProfilesForLookingFor,
      ageData,
      reportStats,
    ] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'DELETED' } } }),
      prisma.profile.count({ where: { status: { not: 'DELETED' } } }),
      prisma.profile.count({ where: { status: 'ACTIVE', visibility: 'PUBLIC' } }),
      prisma.profile.count({ where: { visibility: 'HIDDEN' } }),
      prisma.profile.count({ where: { status: 'BLOCKED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.profile.count({ where: { createdAt: { gte: today } } }),
      prisma.profile.groupBy({
        by: ['gender'],
        _count: { id: true },
        where: { status: { not: 'DELETED' } },
      }),
      prisma.profile.findMany({
        where: { status: { not: 'DELETED' } },
        select: { lookingFor: true },
      }),
      prisma.profile.findMany({
        where: { status: { not: 'DELETED' } },
        select: { age: true },
      }),
      prisma.report.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Aggregate Looking For breakdown
    const lookingForMap: Record<string, number> = {};
    allProfilesForLookingFor.forEach((p) => {
      p.lookingFor.forEach((tag) => {
        lookingForMap[tag] = (lookingForMap[tag] || 0) + 1;
      });
    });
    const lookingForDistribution = Object.entries(lookingForMap).map(([name, count]) => ({
      name,
      count,
    }));

    // Aggregate Age distribution
    const ageDistribution = [
      { range: '18-21', count: ageData.filter((p) => p.age >= 18 && p.age <= 21).length },
      { range: '22-25', count: ageData.filter((p) => p.age >= 22 && p.age <= 25).length },
      { range: '26-30', count: ageData.filter((p) => p.age >= 26 && p.age <= 30).length },
      { range: '31-40', count: ageData.filter((p) => p.age >= 31 && p.age <= 40).length },
      { range: '41+', count: ageData.filter((p) => p.age >= 41).length },
    ];

    const genderDistribution = genderGroups.map((g) => ({
      name: g.gender,
      count: g._count.id,
    }));

    return sendSuccess(res, {
      kpi: {
        totalUsers,
        totalProfiles,
        activeProfiles,
        hiddenProfiles,
        blockedProfiles,
        pendingReports,
        newUsersToday,
        newProfilesToday,
      },
      charts: {
        genderDistribution,
        lookingForDistribution,
        ageDistribution,
        reportStats: reportStats.map((r) => ({ status: r.status, count: r._count.id })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, status, gender, isVerified, isFeatured, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (q && typeof q === 'string' && q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: 'insensitive' } },
        { user: { email: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }

    if (isVerified !== undefined && isVerified !== 'ALL') {
      where.isVerified = isVerified === 'true';
    }

    if (isFeatured !== undefined && isFeatured !== 'ALL') {
      where.isFeatured = isFeatured === 'true';
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, status: true },
          },
          photos: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
          _count: {
            select: { reports: true, savedBy: true },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return sendSuccess(res, {
      profiles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      customGender,
      pronouns,
      lookingFor,
      bio,
      location,
      whatsapp,
      whatsappVisible,
      instagram,
      instagramVisible,
      visibility = 'PUBLIC',
      isVerified = false,
      isFeatured = false,
      photoUrl,
    } = req.body;

    const dob = new Date(dateOfBirth);
    const age = calculateAge(dob);

    if (age < 18) {
      return sendError(res, 'Profile age must be at least 18', 400);
    }

    const profile = await prisma.profile.create({
      data: {
        name,
        dateOfBirth: dob,
        age,
        gender,
        customGender: gender === 'Other' ? customGender : null,
        pronouns,
        lookingFor: Array.isArray(lookingFor) ? lookingFor : [lookingFor],
        bio,
        location,
        whatsapp: whatsapp ? whatsapp.trim() : null,
        whatsappVisible: Boolean(whatsappVisible),
        instagram: instagram ? instagram.replace('@', '').trim() : null,
        instagramVisible: Boolean(instagramVisible),
        visibility,
        status: 'ACTIVE',
        isVerified: Boolean(isVerified),
        isFeatured: Boolean(isFeatured),
        createdByAdmin: true,
        ...(photoUrl
          ? {
              photos: {
                create: {
                  url: photoUrl,
                  isPrimary: true,
                },
              },
            }
          : {}),
      },
      include: {
        photos: true,
      },
    });

    // Log admin action
    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: 'CREATE_PROFILE',
          targetType: 'PROFILE',
          targetId: profile.id,
          metadata: { name: profile.name, gender: profile.gender },
        },
      });
    }

    return sendSuccess(res, profile, 'Profile created successfully by Admin', 201);
  } catch (error) {
    next(error);
  }
};

export const toggleVerifyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return sendError(res, 'Profile not found', 404);

    const updated = await prisma.profile.update({
      where: { id },
      data: { isVerified: !profile.isVerified },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: updated.isVerified ? 'VERIFY_PROFILE' : 'UNVERIFY_PROFILE',
          targetType: 'PROFILE',
          targetId: profile.id,
          metadata: { previous: profile.isVerified, current: updated.isVerified },
        },
      });
    }

    return sendSuccess(
      res,
      updated,
      updated.isVerified ? 'Profile verified by moderation' : 'Profile verification removed'
    );
  } catch (error) {
    next(error);
  }
};

export const toggleFeatureProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return sendError(res, 'Profile not found', 404);

    const updated = await prisma.profile.update({
      where: { id },
      data: { isFeatured: !profile.isFeatured },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: updated.isFeatured ? 'FEATURE_PROFILE' : 'UNFEATURE_PROFILE',
          targetType: 'PROFILE',
          targetId: profile.id,
        },
      });
    }

    return sendSuccess(
      res,
      updated,
      updated.isFeatured ? 'Profile added to Featured showcase' : 'Profile removed from Featured showcase'
    );
  } catch (error) {
    next(error);
  }
};

export const toggleBlockProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return sendError(res, 'Profile not found', 404);

    const newStatus = profile.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';

    const updated = await prisma.profile.update({
      where: { id },
      data: { status: newStatus },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: newStatus === 'BLOCKED' ? 'BLOCK_PROFILE' : 'UNBLOCK_PROFILE',
          targetType: 'PROFILE',
          targetId: profile.id,
        },
      });
    }

    return sendSuccess(
      res,
      updated,
      newStatus === 'BLOCKED' ? 'Profile blocked and hidden from public search' : 'Profile unblocked and reactivated'
    );
  } catch (error) {
    next(error);
  }
};

export const deleteProfileByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const updated = await prisma.profile.update({
      where: { id },
      data: {
        status: 'DELETED',
        visibility: 'HIDDEN',
        deletedAt: new Date(),
      },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: 'DELETE_PROFILE',
          targetType: 'PROFILE',
          targetId: id,
        },
      });
    }

    return sendSuccess(res, updated, 'Profile soft deleted');
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              age: true,
              gender: true,
              status: true,
              photos: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return sendSuccess(res, {
      reports,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, resolutionNotes, actionOnProfile } = req.body;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return sendError(res, 'Report not found', 404);

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolutionNotes,
        resolvedByAdminId: req.user ? req.user.id : null,
      },
    });

    if (actionOnProfile === 'BLOCK') {
      await prisma.profile.update({
        where: { id: report.profileId },
        data: { status: 'BLOCKED' },
      });
    }

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: `RESOLVE_REPORT_${status}`,
          targetType: 'REPORT',
          targetId: id,
          metadata: { status, resolutionNotes, actionOnProfile },
        },
      });
    }

    return sendSuccess(res, updated, 'Report updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, role, status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (q && typeof q === 'string' && q.trim()) {
      where.email = { contains: q.trim(), mode: 'insensitive' };
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          profile: {
            select: { id: true, name: true, isVerified: true, status: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, {
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    if (req.user) {
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: `UPDATE_USER_STATUS_${status}`,
          targetType: 'USER',
          targetId: id,
          metadata: { status },
        },
      });
    }

    return sendSuccess(res, updated, `User status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    // Only super admin can change user roles
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return sendError(res, 'Only Super Administrators can modify roles', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, status: true },
    });

    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: `UPDATE_USER_ROLE_${role}`,
        targetType: 'USER',
        targetId: id,
        metadata: { role },
      },
    });

    return sendSuccess(res, updated, `User role changed to ${role}`);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.adminAction.findMany({
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
        include: {
          admin: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.adminAction.count(),
    ]);

    return sendSuccess(res, {
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};
