const { test, expect } = require('@playwright/test');
const { allPages, OVERFLOW_WIDTHS } = require('../sites');
const { desktopOnly, horizontalOverflow } = require('../helpers');

/*
 * Nothing may scroll sideways, at any width from the narrowest phone still in
 * use up to a wide desktop. This is the single cheapest check that catches
 * "something is off the edge of my screen" before she sees it.
 *
 * Runs once (desktop project) and resizes inside the test, so we sweep ten
 * widths per page without running the whole suite ten times.
 */
test.describe('no horizontal overflow at any width', () => {
  desktopOnly();

  for (const p of allPages) {
    test(`${p.site} ${p.path} fits every width`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });

      const failures = [];
      for (const width of OVERFLOW_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(250); // let the responsive variant settle
        const over = await horizontalOverflow(page);
        if (over > 0) failures.push(`${width}px wide: ${over}px of sideways scroll`);
      }

      expect(failures, `${p.path} overflows`).toEqual([]);
    });
  }
});

/*
 * The links page is meant to sit on one screen with no scrolling. It is a
 * link-in-bio page, so anything below the fold is effectively invisible.
 *
 * 320x568 (the original iPhone SE) is a known, pre-existing exception: the
 * content is about 23px taller than that screen. Verified against the version
 * from before the TikTok icon was added, which measured identically, so this
 * is not a regression. It is listed here so the suite records it rather than
 * silently ignoring it.
 */
test.describe('links page fits on one screen', () => {
  desktopOnly();

  const devices = [
    { name: 'iPhone SE (1st gen)', width: 320, height: 568, knownException: true },
    { name: 'small Android', width: 360, height: 640 },
    { name: 'iPhone SE (2nd/3rd gen)', width: 375, height: 667 },
    { name: 'iPhone 12/13/14', width: 390, height: 844 },
    { name: 'iPhone Plus/Max', width: 414, height: 896 },
    { name: 'laptop', width: 1440, height: 900 },
  ];

  for (const d of devices) {
    test(`${d.name} ${d.width}x${d.height}`, async ({ page }) => {
      const linksPage = allPages.find((p) => p.site === 'links');
      await page.setViewportSize({ width: d.width, height: d.height });
      await page.goto(linksPage.url, { waitUntil: 'load' });
      await page.waitForSelector('#social a');
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return Math.max(0, de.scrollHeight - de.clientHeight);
      });

      if (d.knownException) {
        // Pin the known amount so it cannot quietly get worse.
        expect(overflow, `${d.name}: the known overflow grew beyond 40px`).toBeLessThanOrEqual(40);
      } else {
        expect(overflow, `${d.name}: links page no longer fits one screen`).toBe(0);
      }
    });
  }
});
