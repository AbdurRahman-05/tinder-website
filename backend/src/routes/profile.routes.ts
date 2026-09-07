import { Router } from 'express';
import {
  getProfiles,
  getFeaturedProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
} from '../controllers/profile.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  createProfileSchema,
  updateProfileSchema,
  profileSearchQuerySchema,
} from '../validators/profile.validator';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', optionalAuth, validateQuery(profileSearchQuerySchema), getProfiles);
router.get('/featured', getFeaturedProfiles);
router.get('/:id', optionalAuth, getProfileById);
router.post('/', authenticate, validateBody(createProfileSchema), createProfile);
router.put('/:id', authenticate, validateBody(updateProfileSchema), updateProfile);
router.post('/upload-photo', authenticate, upload.single('photo'), uploadProfilePhoto);

export default router;
