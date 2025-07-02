// routes/userRoutes.js
import express from 'express';
import {
  markCompetitionViewed,
  confirmCompetition,
  getUnconfirmedViewed,
  skipCompetition,
} from '../controllers/viewControllers.js';

const router = express.Router();

router.post('/view', markCompetitionViewed);
router.post('/confirm', confirmCompetition);
router.post('/skip', skipCompetition);
router.get('/unconfirmed/:email', getUnconfirmedViewed);

export default router;
