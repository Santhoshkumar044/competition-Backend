import express from 'express';
import { confirmRegistration } from '../controllers/confirmationControllers.js';

const router = express.Router();

router.post('/confirm-register', confirmRegistration);

export default router;
