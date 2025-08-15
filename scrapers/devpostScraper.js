import puppeteer from 'puppeteer';

export const scrapeDevpost = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:puppeteer.executablePath(), 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();

  await page.goto('https://devpost.com/hackathons', { waitUntil: 'networkidle2' });

  // Scroll the window, not container
  await page.evaluate(async () => {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    let lastHeight = document.body.scrollHeight;
    let sameHeight = 0;

    while (sameHeight < 2) {
      window.scrollBy(0, 1500);
      await delay(2000);

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        sameHeight++;
      } else {
        sameHeight = 0;
        lastHeight = newHeight;
      }
    }
  });

  const hackathons = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.hackathon-tile'));
    return cards.map(card => {
      const title = card.querySelector('h3')?.innerText.trim();
      const daysLeft = card.querySelector('.status-label')?.innerText.trim();
      const prizeAmount = card.querySelector('.prize-amount')?.innerText.trim();
      const organiser = card.querySelector('span.host-label')?.getAttribute('title')?.trim();
      const mode = card.querySelector('.fa-globe')?.nextElementSibling?.innerText.trim() || 'Online';
      const location = card.querySelector('.fa-map-marker-alt')?.nextElementSibling?.innerText.trim() || '';
      const link = card.querySelector('a.tile-anchor')?.href;

      return {
        title,
        daysLeft,
        prize: prizeAmount || 'Non cash prize',
        organiser,
        mode,
        location,
        link,
      };
    });
  });

  await browser.close();

  return hackathons.filter(h => {
    if (!h.title || !h.daysLeft || !h.organiser) return false;

    const status = h.daysLeft.toLowerCase();
    const isEnded = status.includes('ended') || status.includes('over') || status.includes('closed') || status.includes('deadline');

    if (isEnded) return false;

    if (h.mode.toLowerCase() === 'online') return true;
    return h.mode.toLowerCase() === 'offline' && h.location.toLowerCase().includes('india');
  });
};
