// Bing's URL inspection flagged the site for two h1 tags per page and for
// images with no description. Framer ships each page's main heading once per
// screen size, so the phone copy stays <h1> and the other copies are <p> with
// heading semantics. On about-he the active menu label was also wrapped in an
// h1; it is plain text now. Decorative backgrounds keep alt="" on purpose.
const { test, expect } = require('@playwright/test');

const LOCAL = process.env.TARGET === 'local';
const MAIN = LOCAL ? 'http://localhost:8801' : 'https://yaelfried.com';
const url = page => LOCAL ? `${MAIN}/${page === '' ? 'index' : page}.html` : `${MAIN}/${page}`;

const HE = ['', 'about-he', 'contact-he', 'process-he', 'trace-suggestion-he', 'treatment-he'];
const EN = ['home-en', 'about', 'contact', 'process', 'trace-suggestion', 'treatment'];

const MEANINGFUL = ['uAc7IoceHyMHd9u1q7mUG8CnPoU', 'BEIOa8exLjpwKtI5RDB9FiQAWE', 'gtf5ckWUI7YTReMsImBYYfkZAfc'];

for (const page of [...HE, ...EN]) {
  const name = page || 'index';
  const logo = HE.includes(page) ? 'logo-he-480' : 'logo-en-480';

  test(`${name}: source has exactly one h1`, async ({ request }) => {
    const html = await (await request.get(url(page))).text();
    expect((html.match(/<h1[\s>]/g) || []).length).toBe(1);
  });

  test(`${name}: logo, social icons and studio logo carry a description`, async ({ request }) => {
    const html = await (await request.get(url(page))).text();
    const imgs = html.match(/<img[^>]*>/g) || [];
    for (const key of [logo, ...MEANINGFUL]) {
      const found = imgs.filter(t => t.includes(key));
      expect(found.length, key).toBeGreaterThan(0);
      for (const t of found) expect(t, key).toMatch(/alt="[^"]+"/);
    }
  });

  test(`${name}: one level-1 heading is visible at this screen size`, async ({ page: p }) => {
    await p.goto(url(page));
    const visible = await p.$$eval('h1, [role="heading"][aria-level="1"]',
      els => els.filter(e => e.getClientRects().length && e.offsetHeight > 0).length);
    expect(visible).toBe(1);
  });
}
