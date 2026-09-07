import { Router } from 'express';
import {
  saveProfile,
  unsaveProfile,
  getSavedProfiles,
  blockProfile,
  unblockProfile,
  reportProfile,
} from '../controllers/interaction.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { reportSchema } from '../validators/interaction.validator';

const router = Router();

router.get('/saved', authenticate, getSavedProfiles);
router.post('/:id/save', authenticate, saveProfile);
router.delete('/:id/save', authenticate, unsaveProfile);
router.post('/:id/block', authenticate, blockProfile);
router.delete('/:id/block', authenticate, unblockProfile);
router.post('/:id/report', optionalAuth, validateBody(reportSchema), reportProfile);

export default router;
