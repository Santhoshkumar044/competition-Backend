import { scrapeDevpost } from "../scrapers/devpostScraper.js";
import { scrapeUnstop } from "../scrapers/unstopScraper.js";
import { cleanupExpiredPendingCompetitions } from "../controllers/competitionControllers.js"; 

export class ScrapingScheduler {
  constructor(competitionService) {
    this.competitionService = competitionService;
    this.SCRAPING_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
    this.interval = null;
  }

  async executeScraping() {
    try {
      console.log('🔄 Starting scraping process...');
      const devpost = await scrapeDevpost();
      const unstop = await scrapeUnstop();

      await this.competitionService.saveNewCompetitions([...devpost, ...unstop]);
      console.log('✅ Scraping completed');

      // Run cleanup after scrape
      await cleanupExpiredPendingCompetitions({
        models: { Competition: this.competitionService.models.Competition }
      }, { json: console.log }); // mock res for logging
    } catch (err) {
      console.error('❌ Scraping or cleanup error:', err);
    }
  }

  start() {
    console.log('⏱ Scraping scheduler started');

    this.executeScraping(); // Initial immediate run

    this.interval = setInterval(() => {
      this.executeScraping();
    }, this.SCRAPING_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log(' Scraping scheduler stopped');
    }
  }
}