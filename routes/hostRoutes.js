import express from 'express';
import { createHost } from '../controllers/hostControllers.js';
import isHost from '../middleware/isHost.js';

const router = express.Router();

router.post('/add-host', createHost);
router.use(isHost)

export default router;
