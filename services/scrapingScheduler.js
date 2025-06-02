import { scrapeAllSources } from '../controllers/scraperController.js';

const SCRAPING_INTERVAL = 3 * 60 * 60 * 1000; 

let scrapingInterval;

export const startScrapingScheduler = () => {
  console.log('Starting scraping scheduler...');
  
  scrapeAllSources().catch(err => {
    console.error('Initial scraping error:', err);
  });

  scrapingInterval = setInterval(() => {
    scrapeAllSources().catch(err => {
      console.error('Scheduled scraping error:', err);
    });
  }, SCRAPING_INTERVAL);
};

export const stopScrapingScheduler = () => {
  if (scrapingInterval) {
    clearInterval(scrapingInterval);
    console.log('Scraping scheduler stopped');
  }
};