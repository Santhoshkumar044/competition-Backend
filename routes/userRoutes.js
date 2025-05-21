import { Router } from 'express';
import { getCurrentUser } from '../controllers/userControllers.js';

const router = Router();

router.get('/api/user', getCurrentUser);

export default router;