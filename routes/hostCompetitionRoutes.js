import { Router } from 'express';
import isHost from '../middleware/isHost.js';
import {
  approveCompetition,
  cleanupExpiredPendingCompetitions,
  rejectOrDeleteCompetition,
  getApprovedCompetitions
} from '../controllers/competitionControllers.js';

const router = Router();

// PATCH /api/host/competitions/:id/approve
router.patch('/:id/approve', isHost, approveCompetition);

// PATCH /api/host/competitions/:id/reject
router.patch('/:id/reject', isHost, rejectOrDeleteCompetition);

// DELETE /api/host/competitions/cleanup
router.delete('/cleanup', isHost, cleanupExpiredPendingCompetitions);

// Add this to your competition routes (probably in competitionRoutes.js)
router.get('/approved/latest', getApprovedCompetitions);
export default router;
