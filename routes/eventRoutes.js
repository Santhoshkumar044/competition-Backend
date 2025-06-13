// routes/eventRoutes.js
import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventControllers.js';
import isHost from '../middleware/isHost.js';

const router = express.Router();

/**
 * @route POST /events
 * @desc Create a new event (venue booking handled separately)
 */
router.post('/events',isHost, createEvent);

/**
 * @route GET /events
 * @desc Get all events
 */
router.get('/events', getAllEvents);

/**
 * @route GET /events/:id
 * @desc Get specific event by ID
 */
router.get('/events/:id', getEventById);

/**
 * @route PUT /events/:id
 * @desc Update an existing event
 */
router.put('/events/:id', isHost, updateEvent);

/**
 * @route DELETE /events/:id
 * @desc Delete an event
 */
router.delete('/events/:id', isHost, deleteEvent);

export default router;