import puppeteer from 'puppeteer';

export const scrapeUnstop = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: puppeteer.executablePath(), //Use installed Chrome
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://unstop.com/hackathons', { waitUntil: 'networkidle2' });

  // Scroll the actual hackathon list container
  await page.evaluate(async () => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const container = document.querySelector('.user_list.custom-scrollbar.thin.bdr-rds-none');
    if (!container) return;

    let lastScrollHeight = container.scrollHeight;
    let sameHeightCount = 0;

    while (sameHeightCount < 3) {
      container.scrollBy(0, 1000);
      await delay(1500);

      const currentScrollHeight = container.scrollHeight;
      if (currentScrollHeight === lastScrollHeight) {
        sameHeightCount++;
      } else {
        sameHeightCount = 0;
        lastScrollHeight = currentScrollHeight;
      }
    }
  });

  // Extract all the loaded hackathons
  const data = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll('[id^="i_"]');

    cards.forEach(card => {
      const title = card.querySelector('h2')?.innerText?.trim() || '';
      const location = card.querySelector('p')?.innerText?.trim() || '';

      const timingDivs = Array.from(card.querySelectorAll('div.seperate_box.align-center'));
      const daysLeftDiv = timingDivs.find(div => {
        const span = div.querySelector('span');
        return span && span.innerText.toLowerCase().includes('days left');
      });
      const daysLeft = daysLeftDiv ? daysLeftDiv.textContent.trim().replace(/\s+/g, ' ') : '';

      const prize = card.querySelector('div.seperate_box.prize')?.innerText.trim() || 'Non cash prize';
      const organiser = card.querySelector('.content p')?.innerText.trim() || 'Unstop';

      const id = card.getAttribute('id')?.split('_')[1];
      const link = id ? `https://unstop.com/hackathon/${title.toLowerCase().replace(/\s+/g, '-')}-${id}` : '';

      results.push({ title, location, organiser, prize, daysLeft, link });
    });

    return results;
  });

  await browser.close();

  return data.filter(item => item.title && item.link);
};
