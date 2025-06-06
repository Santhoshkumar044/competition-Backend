import { Router } from 'express';
import { check } from 'express-validator';
import isHost from '../middleware/isHost.js';
import {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition
} from '../controllers/competitionControllers.js';

const router = Router();

/**
 * POST /api/competitions
 * Create a new competition by host
 */
router.post(
  '/',
  isHost,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('organiser', 'Organizer is required').not().isEmpty(),
    check('mode', 'Mode is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('daysLeft', 'Days left is required').not().isEmpty(),
    check('link', 'Registration URL is required').not().isEmpty(),
  ],
  createCompetition
);

/**
 * GET /api/competitions
 * Get all competitions
 */
router.get('/', getCompetitions);

/**
 * GET /api/competitions/:id
 * Get a specific competition by ID
 */
router.get('/:id', getCompetitionById);

/**
 * PUT /api/competitions/:id
 * Update a competition by ID (host only)
 */
router.put('/:id', isHost, updateCompetition);

/**
 * DELETE /api/competitions/:id
 * Delete a competition by ID (host only)
 */
router.delete('/:id', isHost, deleteCompetition);

export default router;
