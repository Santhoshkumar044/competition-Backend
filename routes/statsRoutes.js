import express from 'express';
import { getParticipantStats } from '../controllers/statsController.js';

const router = express.Router();

//gET /api/stats/:id/participant-stats
router.get('/:id/participant-stats', getParticipantStats);

export default router;
