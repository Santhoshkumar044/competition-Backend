import cron from 'node-cron';
import syncCompetitionSheet from '../services/sheetSyncService.js'; // Make sure this file uses ES6 export

// Run every 3 hours
cron.schedule('*/25 * * * *', () => {
  console.log('🕒 Scheduled sheet sync started...');
  syncCompetitionSheet();
});

// Optional: Initial sync on server startup
syncCompetitionSheet();