import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import interactionRoutes from './interaction.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/interactions', interactionRoutes);
router.use('/admin', adminRoutes);

export default router;
