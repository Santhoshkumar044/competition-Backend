import { scrapeDevpost } from '../scrapers/devpostScraper.js';
import { scrapeUnstop } from '../scrapers/unstopScraper.js';
import { saveNewCompetitions } from '../services/competitionService.js';

const scrapeAllSources = async () => {
  try {
    console.log('Starting scraping process...');
    const devpost = await scrapeDevpost();
    const unstop = await scrapeUnstop();

    await saveNewCompetitions([...devpost, ...unstop]);
    console.log('Scraping completed successfully');
  } catch (err) {
    console.error('Scraping error:', err);
    throw err;
  }
};

// For API routes
export const scrapeAllSourcesHandler = async (req, res) => {
  try {
    await scrapeAllSources();
    res.status(200).json({ message: 'Scraping complete.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed.' });
  }
};

// For internal use (scheduler)
export { scrapeAllSources };