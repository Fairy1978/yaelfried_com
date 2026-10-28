// Bing's URL inspection flagged the homepage for two h1 tags and for images
// with no description. Framer ships the hero heading twice (one copy per
// screen size), so the desktop copy is a <p> with heading semantics and only
// the phone copy stays <h1>. Decorative backgrounds keep alt="" on purpose.
const { test, expect } = require('@playwright/test');

const MAIN = process.env.TARGET === 'local' ? 'http://localhost:8801' : 'https://yaelfried.com';
const HOME = process.env.TARGET === 'local' ? MAIN + '/index.html' : MAIN + '/';

test('homepage source has exactly one h1', async ({ request }) => {
  const html = await (await request.get(HOME)).text();
  expect((html.match(/<h1[\s>]/g) || []).length).toBe(1);
  expect(html).toContain('<p role="heading" aria-level="1" class="framer-text"');
});

test('logo, social icons and studio logo all carry a description', async ({ request }) => {
  const html = await (await request.get(HOME)).text();
  const imgs = html.match(/<img[^>]*>/g) || [];
  const of = key => imgs.filter(t => t.includes(key));
  for (const [key, n] of [['logo-he-480', 3], ['uAc7IoceHyMHd9u1q7mUG8CnPoU', 3], ['BEIOa8exLjpwKtI5RDB9FiQAWE', 1], ['gtf5ckWUI7YTReMsImBYYfkZAfc', 3]]) {
    expect(of(key)).toHaveLength(n);
    for (const t of of(key)) expect(t).toMatch(/alt="[^"]+"/);
  }
});

test('one level-1 heading is visible at this screen size', async ({ page }) => {
  await page.goto(HOME);
  const visible = await page.$$eval('h1, [role="heading"][aria-level="1"]',
    els => els.filter(e => e.getClientRects().length && e.offsetHeight > 0).length);
  expect(visible).toBe(1);
});
