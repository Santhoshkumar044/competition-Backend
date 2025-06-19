import express from 'express';
import syncCompetitionSheet from '../services/sheetSyncService.js';

const router = express.Router();

router.get('/sync-competition-sheet', async (req, res) => {
  try {
    await syncCompetitionSheet();
    res.status(200).json({ message: 'Sheet sync completed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync', detail: err.message });
  }
});

export default router;