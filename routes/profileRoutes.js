import express from 'express';
import { createOrUpdateProfile, getMyProfile } from '../controllers/profileControllers.js';

const router = express.Router();

router.post('/create', createOrUpdateProfile);
router.get('/me', getMyProfile);

export default router;