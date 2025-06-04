import express from 'express';
import { createProfile, updateProfile } from '../controllers/profileControllers.js';

const router = express.Router();

router.post('/create', createProfile);
router.put('/update/:id', updateProfile);

export default router;
