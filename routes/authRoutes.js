import { Router } from 'express';
import { googleAuth, googleAuthCallback, logout } from '../controllers/authControllers.js';
import { getCurrentUser } from '../controllers/userControllers.js';
const router = Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
router.get('/auth/logout', logout);
router.get('/current-user',getCurrentUser);

export default router;