// routes/userRoutes.js
import express from 'express';
import {
  markCompetitionViewed,
  confirmCompetition,
  getUnconfirmedViewed,
} from '../controllers/viewControllers.js';

const router = express.Router();

router.post('/view', markCompetitionViewed);
router.post('/confirm', confirmCompetition);
router.get('/unconfirmed/:email', getUnconfirmedViewed);

export default router;
