import express from 'express';
import { confirmEventRegistration } from '../controllers/eventConfirmation.js';

const router = express.Router();

router.post('/confirm-register', confirmEventRegistration);

export default router;