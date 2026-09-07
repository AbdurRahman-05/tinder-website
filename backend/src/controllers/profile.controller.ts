import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { calculateAge } from '../validators/auth.validator';
import { processUploadedFile } from '../middleware/upload.middleware';

export const getProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q,
      gender,
      lookingFor,
      minAge,
      maxAge,
      location,
      isVerified,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(60, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Base criteria: ONLY active and public profiles
    const where: any = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      deletedAt: null,
    };

    // If authenticated, exclude profiles blocked by user or who blocked this user
    if (req.user) {
      const myBlocked = await prisma.block.findMany({
        where: { userId: req.user.id },
        select: { profileId: true },
      });
      const blockedMe = await prisma.block.findMany({
        where: {
          profile: {
            userId: req.user.id,
          },
        },
        select: { userId: true },
      });

      const excludeProfileIds = myBlocked.map((b) => b.profileId);
      const excludeUserIds = blockedMe.map((b) => b.userId);

      where.AND = [
        ...(where.AND || []),
        { id: { notIn: excludeProfileIds } },
        ...(excludeUserIds.length > 0 ? [{ userId: { notIn: excludeUserIds } }] : []),
      ];

      // Exclude self from discovery
      if (req.user.id) {
        where.userId = { not: req.user.id };
      }
    }

    // Name search (case-insensitive)
    if (q && typeof q === 'string' && q.trim()) {
      where.name = {
        contains: q.trim(),
        mode: 'insensitive',
      };
    }

    // Gender filter
    if (gender && typeof gender === 'string' && gender !== 'All') {
      where.gender = gender;
    }

    // Looking For filter (multi-category match)
    if (lookingFor && typeof lookingFor === 'string') {
      const categories = lookingFor.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        where.lookingFor = {
          hasSome: categories,
        };
      }
    }

    // Age range filters
    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = Number(minAge);
      if (maxAge) where.age.lte = Number(maxAge);
    }

    // Location filter
    if (location && typeof location === 'string' && location.trim()) {
      where.location = {
        contains: location.trim(),
        mode: 'insensitive',
      };
    }

    // Verified filter
    if (isVerified === 'true') {
      where.isVerified = true;
    }

    // Order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'updated') orderBy = { updatedAt: 'desc' };
    if (sort === 'alphabetical') orderBy = { name: 'asc' };

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          customGender: true,
          pronouns: true,
          lookingFor: true,
          bio: true,
          location: true,
          isVerified: true,
          isFeatured: true,
          whatsappVisible: true,
          whatsapp: true,
          instagramVisible: true,
          instagram: true,
          createdAt: true,
          photos: {
            orderBy: { isPrimary: 'desc' },
            select: {
              id: true,
              url: true,
              isPrimary: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    // Sanitize contact info based on visibility permissions
    const sanitizedProfiles = profiles.map((p) => ({
      ...p,
      whatsapp: p.whatsappVisible ? p.whatsapp : null,
      instagram: p.instagramVisible ? p.instagram : null,
    }));

    return sendSuccess(res, {
      profiles: sanitizedProfiles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + profiles.length < total,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProfiles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const featured = await prisma.profile.findMany({
      where: {
        status: 'ACTIVE',
        visibility: 'PUBLIC',
        isFeatured: true,
        deletedAt: null,
      },
      take: 8,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        pronouns: true,
        lookingFor: true,
        bio: true,
        location: true,
        isVerified: true,
        photos: {
          orderBy: { isPrimary: 'desc' },
          take: 1,
          select: { url: true },
        },
      },
    });

    return sendSuccess(res, featured);
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { isPrimary: 'desc' },
        },
      },
    });

    if (!profile || profile.deletedAt) {
      return sendError(res, 'Profile not found or no longer available', 404);
    }

    const isOwner = Boolean(req.user && req.user.id === profile.userId);
    const isAdmin = Boolean(req.user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(req.user.role));

    // If profile is not active/public, only owner or admin can view
    if (profile.status !== 'ACTIVE' || profile.visibility !== 'PUBLIC') {
      if (!isOwner && !isAdmin) {
        return sendError(res, 'Profile is private or unavailable', 404);
      }
    }

    // Check if current user saved or blocked this profile
    let isSaved = false;
    let isBlocked = false;

    if (req.user) {
      const [saved, blocked] = await Promise.all([
        prisma.savedProfile.findUnique({
          where: {
            userId_profileId: {
              userId: req.user.id,
              profileId: profile.id,
            },
          },
        }),
        prisma.block.findUnique({
          where: {
            userId_profileId: {
              userId: req.user.id,
              profileId: profile.id,
            },
          },
        }),
      ]);
      isSaved = Boolean(saved);
      isBlocked = Boolean(blocked);
    }

    // Safe public response: mask full DOB (never expose DOB)
    const sanitized = {
      id: profile.id,
      userId: isOwner || isAdmin ? profile.userId : undefined,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      customGender: profile.customGender,
      pronouns: profile.pronouns,
      lookingFor: profile.lookingFor,
      bio: profile.bio,
      location: profile.location,
      whatsapp: isOwner || isAdmin || profile.whatsappVisible ? profile.whatsapp : null,
      whatsappVisible: profile.whatsappVisible,
      instagram: isOwner || isAdmin || profile.instagramVisible ? profile.instagram : null,
      instagramVisible: profile.instagramVisible,
      visibility: profile.visibility,
      status: profile.status,
      isVerified: profile.isVerified,
      isFeatured: profile.isFeatured,
      createdAt: profile.createdAt,
      photos: (profile as any).photos?.map((ph: any) => ({
        id: ph.id,
        url: ph.url,
        isPrimary: ph.isPrimary,
      })) || [],
      isOwner,
      isSaved,
      isBlocked,
    };

    return sendSuccess(res, sanitized);
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    // Check if user already has a profile
    const existing = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing && existing.status !== 'DELETED') {
      return sendError(res, 'You already have a profile. Please edit your existing profile.', 400);
    }

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
      photoUrl,
    } = req.body;

    const dob = new Date(dateOfBirth);
    const age = calculateAge(dob);

    if (age < 18) {
      return sendError(res, 'You must be at least 18 years old to create a profile on PRISM.', 400);
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId: req.user.id,
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
        isVerified: false,
        createdByAdmin: false,
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

    return sendSuccess(res, profile, 'Profile created successfully!', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const id = req.params.id as string;

    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const isOwner = profile.userId === req.user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return sendError(res, 'You do not have permission to edit this profile', 403);
    }

    const {
      name,
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
      visibility,
      status,
    } = req.body;

    const updated = await prisma.profile.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(gender ? { gender } : {}),
        ...(gender ? { customGender: gender === 'Other' ? customGender : null } : {}),
        ...(pronouns !== undefined ? { pronouns } : {}),
        ...(lookingFor ? { lookingFor: Array.isArray(lookingFor) ? lookingFor : [lookingFor] } : {}),
        ...(bio ? { bio } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(whatsapp !== undefined ? { whatsapp: whatsapp ? whatsapp.trim() : null } : {}),
        ...(whatsappVisible !== undefined ? { whatsappVisible: Boolean(whatsappVisible) } : {}),
        ...(instagram !== undefined ? { instagram: instagram ? instagram.replace('@', '').trim() : null } : {}),
        ...(instagramVisible !== undefined ? { instagramVisible: Boolean(instagramVisible) } : {}),
        ...(visibility ? { visibility } : {}),
        ...(isAdmin && status ? { status } : {}),
      },
      include: {
        photos: true,
      },
    });

    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    if (!req.file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return sendError(res, 'You need to create a profile first', 400);
    }

    const result = await processUploadedFile(req, req.file);

    // Set existing photos to non-primary
    await prisma.profilePhoto.updateMany({
      where: { profileId: profile.id },
      data: { isPrimary: false },
    });

    const photo = await prisma.profilePhoto.create({
      data: {
        profileId: profile.id,
        url: result.url,
        publicId: result.publicId,
        isPrimary: true,
      },
    });

    return sendSuccess(res, photo, 'Profile photo uploaded successfully');
  } catch (error) {
    next(error);
  }
};
