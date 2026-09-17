import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, q, status = 'ACTIVE' } = req.query;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    if (q && typeof q === 'string' && q.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { location: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
        { creatorName: { contains: q.trim(), mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { date: 'asc' },
      ],
    });

    return sendSuccess(res, {
      events,
      total: events.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    return sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      isVirtual = false,
      virtualLink,
      imageUrl,
      whatsapp,
      instagram,
      googleFormUrl,
      websiteUrl,
      creatorName,
      creatorContact,
    } = req.body;

    if (!title || !description || !date || !location) {
      return sendError(res, 'Title, description, date, and location are required.', 400);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return sendError(res, 'Please provide a valid event date.', 400);
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || 'Meetup',
        date: parsedDate,
        time: time?.trim() || null,
        location: location.trim(),
        isVirtual: Boolean(isVirtual),
        virtualLink: virtualLink?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        whatsapp: whatsapp ? whatsapp.trim().replace(/[^0-9+]/g, '') : null,
        instagram: instagram ? instagram.trim().replace('@', '') : null,
        googleFormUrl: googleFormUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        creatorName: creatorName?.trim() || 'Community Host',
        creatorContact: creatorContact?.trim() || null,
        creatorId: req.user ? req.user.id : null,
        status: 'ACTIVE',
      },
    });

    return sendSuccess(res, event, 'Event launched successfully!', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Event not found', 404);
    }

    await prisma.event.delete({ where: { id } });

    return sendSuccess(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};
