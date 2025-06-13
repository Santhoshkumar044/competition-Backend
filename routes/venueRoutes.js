import express from 'express';
import {
  listVenues,
  bookVenue,
} from '../controllers/venueControllers.js';

const router = express.Router();

// ✅ List all venues: GET /api/venue
router.get('/', listVenues);

// ✅ Book venue: POST /api/venue/book
router.post('/book', bookVenue);

export default router;