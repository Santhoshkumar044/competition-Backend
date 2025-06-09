import express from 'express';
import { createProfile, updateProfile,getMyProfile } from '../controllers/profileControllers.js';

const router = express.Router();

router.post('/create', createProfile);
router.put('/update/:id', updateProfile);
router.get('/me',getMyProfile);
export default router;
