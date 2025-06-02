import express from 'express';
import { scrapeAllSources } from '../controllers/scraperController.js';

const router = express.Router();

router.get('/scrape', scrapeAllSources);

export default router;
