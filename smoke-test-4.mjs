// Full pass: plaza join fix, new sky/trees/tents, jump, arcade games,
// visited badges, pointer lock.
import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:4173/';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const errors = [];
const page = await browser.newPage();
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`));
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: 1280, height: 800 });
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 });
await sleep(1500);
await page.evaluate(() => localStorage.removeItem('park-visited'));

const btn = await page.evaluateHandle(() =>
  [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Enter the park'))
);
await btn.asElement().click();
await sleep(2600);
const lockedAfterStart = await page.evaluate(() => !!document.pointerLockElement);
await page.screenshot({ path: 'shot-n1-spawn.png' });

// Walk to the plaza and jump
await page.keyboard.down('KeyW');
await sleep(2400);
await page.keyboard.up('KeyW');
await sleep(400);
await page.keyboard.press('Space');
await sleep(350);
await page.screenshot({ path: 'shot-n2-jump.png' });
await sleep(900);

// Plaza roundabout look
await page.evaluate(() => document.exitPointerLock());
await sleep(300);
await page.mouse.move(640, 400);
await page.mouse.wheel({ deltaY: 900 });
await sleep(1000);
await page.screenshot({ path: 'shot-n3-plaza.png' });

const travel = async (label) => {
  await page.keyboard.press('KeyM');
  await sleep(450);
  await page.evaluate((l) => {
    [...document.querySelectorAll('.ft-btn')].find((b) => b.textContent.includes(l))?.click();
  }, label);
  await sleep(1200);
};

// Arcade: prompt -> open -> pick snake
await travel('Arcade');
const arcadePrompt = await page.evaluate(() => document.querySelector('.hud-prompt')?.textContent ?? null);
await page.screenshot({ path: 'shot-n4-arcade-zone.png' });
await page.keyboard.press('KeyE');
await sleep(800);
await page.screenshot({ path: 'shot-n5-arcade-picker.png' });
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Snake'))?.click();
});
await sleep(1200);
await page.screenshot({ path: 'shot-n6-snake.png' });
await page.keyboard.press('Escape');
await sleep(500);

// Projects tent + visited badges (about/arcade opened => ✓ somewhere)
await travel('Projects');
await page.screenshot({ path: 'shot-n7-tents.png' });

console.log(JSON.stringify({ lockedAfterStart, arcadePrompt }));
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO RUNTIME ERRORS');
await browser.close();
