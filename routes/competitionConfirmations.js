//this is the route to get the user's confirmed competitions
import express from 'express';
import { getUserConfirmedCompetitions } from '../controllers/competitionConfirmationController.js';

const router = express.Router();

// GET /api/competition-confirmations/user/:profileId
router.get('/user/:profileId', getUserConfirmedCompetitions);

export default router;
