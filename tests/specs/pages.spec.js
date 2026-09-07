const { test, expect } = require('@playwright/test');
const { allPages, mainPages, origin } = require('../sites');
const { desktopOnly, collectErrors, realErrors } = require('../helpers');

test.describe('every page is healthy', () => {
  desktopOnly();

  for (const p of allPages) {
    test(`${p.site} ${p.path} loads and is well formed`, async ({ page }) => {
      const errors = collectErrors(page);

      const res = await page.goto(p.url, { waitUntil: 'load' });
      expect(res, `no response from ${p.url}`).toBeTruthy();
      expect(res.status(), `${p.url} returned ${res.status()}`).toBe(200);

      // A title and a description: both feed search results and both have been
      // lost before by an editing accident.
      const title = (await page.title()).trim();
      expect(title.length, `${p.path} has an empty <title>`).toBeGreaterThan(3);

      const desc = await page.locator('meta[name="description"]').first().getAttribute('content');
      expect(desc && desc.trim().length, `${p.path} has no meta description`).toBeGreaterThan(10);

      // Language and direction. The main site deliberately keeps dir="ltr" on
      // the root even for Hebrew pages, because the exported Framer layout
      // flips and breaks under dir="rtl"; the RTL is applied per text block.
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, `${p.path} has no lang attribute`).toBeTruthy();
      expect(lang.toLowerCase().startsWith(p.lang), `${p.path} lang is "${lang}", expected ${p.lang}`).toBe(true);

      // Structured data must parse. A trailing comma here silently costs rich results.
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      blocks.forEach((b, i) => {
        expect(() => JSON.parse(b), `${p.path} JSON-LD block ${i + 1} does not parse`).not.toThrow();
      });

      // No broken images.
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((img) => img.currentSrc && img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc)
      );
      expect(broken, `${p.path} has broken images`).toEqual([]);

      // No JavaScript errors from our own code.
      expect(realErrors(errors), `${p.path} logged errors`).toEqual([]);
    });
  }
});

test.describe('main site language switcher', () => {
  desktopOnly();

  /*
   * Every page must offer a way into the other language.
   *
   * Note on what this does NOT assert: today the EN/HE toggle on the inner
   * pages goes to the other language's HOME page, not to the matching page.
   * From /about-he, "EN" lands on /home-en rather than /about. That is the
   * site's current behaviour, not a regression, so the suite locks in "there
   * is a working route into the other language" rather than failing on it.
   * If the toggle is ever changed to go page-to-page, tighten this to use
   * `p.alt` and it will start enforcing the stronger promise.
   */
  const HE_PATHS = mainPages.filter((x) => x.lang === 'he').map((x) => x.path);
  const EN_PATHS = mainPages.filter((x) => x.lang === 'en').map((x) => x.path);

  for (const p of mainPages) {
    test(`${p.path} offers a route into ${p.lang === 'he' ? 'English' : 'Hebrew'}`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
      );

      const otherPaths = p.lang === 'he' ? EN_PATHS : HE_PATHS;
      const matches = (target) => {
        const bare = target === '/' ? 'index' : target.replace(/^\//, '');
        return hrefs.some((h) => h === target || h.endsWith(bare + '.html') || h.endsWith(bare));
      };

      const reachable = otherPaths.filter(matches);
      expect(reachable.length, `${p.path} has no link into the other language at all`).toBeGreaterThan(0);
    });
  }
});

test.describe('accessibility widget', () => {
  desktopOnly();

  /*
   * The Enable widget refuses to initialise in headless Chrome: it renders
   * zero nodes, almost certainly by design on their side. So asserting that
   * its button appears would only be testing their bot detection.
   *
   * What we can and do check is the part that is ours to break: the script tag
   * is still on the page, and the licensed URL still resolves. A deleted tag
   * or an expired licence both fail here.
   */
  for (const p of mainPages) {
    test(`${p.path} still loads the Enable widget`, async ({ page, request }) => {
      await page.goto(p.url, { waitUntil: 'domcontentloaded' });

      const src = await page.locator('script[src*="enable.co.il"]').first().getAttribute('src');
      expect(src, `${p.path} lost the accessibility widget script tag`).toBeTruthy();

      const res = await request.get(src, { timeout: 20000 });
      expect(res.status(), `${p.path}: the accessibility script URL returned ${res.status()}`).toBe(200);
      const body = await res.text();
      expect(body.length, `${p.path}: the accessibility script came back empty`).toBeGreaterThan(500);
    });
  }
});
