import { scrapeDevpost } from "../scrapers/devpostScraper.js";
import { scrapeUnstop } from "../scrapers/unstopScraper.js";

export class ScrapingScheduler {
  constructor(competitionService) {
    this.competitionService = competitionService;
    this.SCRAPING_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
    this.interval = null;
  }

  async executeScraping() {
    try {
      console.log('Starting scraping process...');
      const devpost = await scrapeDevpost();
      const unstop = await scrapeUnstop();
      
      await this.competitionService.saveNewCompetitions([...devpost, ...unstop]);
      console.log('Scraping completed successfully');
    } catch (err) {
      console.error('Scraping error:', err);
      throw err;
    }
  }

  start() {
    console.log('Starting scraping scheduler...');
    
    this.executeScraping().catch(err => {
      console.error('Initial scraping error:', err);
    });

    this.interval = setInterval(() => {
      this.executeScraping().catch(err => {
        console.error('Scheduled scraping error:', err);
      });
    }, this.SCRAPING_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('Scraping scheduler stopped');
    }
  }
}