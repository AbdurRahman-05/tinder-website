import { Router } from 'express';
import { register, login, refreshToken, getMe, deleteAccount } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/delete-account', authenticate, deleteAccount);

export default router;
