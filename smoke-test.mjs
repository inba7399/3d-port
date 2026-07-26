// Smoke test for the single-page portfolio: loads the preview build at
// desktop + mobile sizes, scrolls through every section, captures
// screenshots and reports console/page errors.
import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:4173/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = process.env.SHOT_DIR || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

const errors = [];

async function run(label, viewport) {
  const page = await browser.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${label}][console] ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`[${label}][pageerror] ${e.message}`));
  await page.setViewport(viewport);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(2200); // let the hero entrance animation finish

  await page.screenshot({ path: `${OUT}/shot-${label}-1-hero.png` });

  // horizontal overflow check
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 1) errors.push(`[${label}] horizontal overflow: ${overflow}px`);

  for (const [i, sel] of ['#about', '#projects', '#contact'].entries()) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView(), sel);
    await sleep(1600); // smooth scroll + whileInView reveals
    await page.screenshot({ path: `${OUT}/shot-${label}-${i + 2}-${sel.slice(1)}.png` });
  }

  // navbar should hide after a long downward scroll, and come back on scroll up
  const navHiddenDown = await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 700));
    window.scrollTo(0, 1500);
    await new Promise((r) => setTimeout(r, 900));
    const el = document.querySelector('.motion-nav > div');
    return el ? getComputedStyle(el).transform : 'missing';
  });

  // footer view
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/shot-${label}-5-footer.png` });

  console.log(JSON.stringify({ label, overflow, navHiddenDown }));
  await page.close();
}

await run('desktop', { width: 1280, height: 800 });
await run('tablet', { width: 820, height: 1180, isMobile: true, hasTouch: true });
await run('mobile', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await run('narrow', { width: 320, height: 568, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO RUNTIME ERRORS');
await browser.close();
