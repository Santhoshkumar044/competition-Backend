import puppeteer from 'puppeteer';

export const scrapeUnstop = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('https://unstop.com/hackathons', { waitUntil: 'networkidle2' });

  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

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
  return data;
};
