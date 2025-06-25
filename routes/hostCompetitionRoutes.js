import { Router } from 'express';
import isHost from '../middleware/isHost.js';
import {
  approveCompetition,
  cleanupExpiredPendingCompetitions,
  rejectOrDeleteCompetition
} from '../controllers/competitionControllers.js';

const router = Router();

// PATCH /api/host/competitions/:id/approve
router.patch('/:id/approve', isHost, approveCompetition);

// PATCH /api/host/competitions/:id/reject
router.patch('/:id/reject', isHost, rejectOrDeleteCompetition);

// DELETE /api/host/competitions/cleanup
router.delete('/cleanup', isHost, cleanupExpiredPendingCompetitions);

export default router;
