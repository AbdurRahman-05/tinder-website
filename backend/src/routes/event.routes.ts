import { Router } from 'express';
import { getEvents, getEventById, createEvent, deleteEvent } from '../controllers/event.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', optionalAuth, createEvent);
router.delete('/:id', authenticate, deleteEvent);

export default router;
