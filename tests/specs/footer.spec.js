const { test, expect } = require('@playwright/test');
const { mainPages, landingPages, linksPages, SOCIALS } = require('../sites');
const { topOf, lineCount, horizontalOverflow } = require('../helpers');

/*
 * The footers, on both a phone and a desktop.
 *
 * Everything asserted here is something that has actually broken or been
 * asked for, so each check is here to stop a specific regression:
 *  - the four social icons, on one line (they wrapped into a 2x2 block once)
 *  - the tagline above the icons in BOTH languages (the Hebrew and English
 *    builds list them in opposite DOM order, so they drifted apart)
 *  - the Break the Loop link on its own line on phones, above the legal links
 *  - desktop keeps its original arrangement and its 100px circles
 */

const ICONS = 'div[data-framer-name="icons"]';
const TAGLINE = '[data-framer-name="For more content and inspiration"]';
const LEGAL = '[data-framer-name="Terms of use"], [data-framer-name="Privacy Policy"]';
const COPYRIGHT = '[data-framer-name^="All rights"]';
const BTL = 'a[href*="breaktheloop"]';

async function visibleSocials(page) {
  return page.evaluate((sel) => {
    const row = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null);
    if (!row) return null;
    return [...row.children].map((a) => ({
      href: a.getAttribute('href') || '',
      width: Math.round(a.getBoundingClientRect().width),
      top: Math.round(a.getBoundingClientRect().top),
    }));
  }, ICONS);
}

test.describe('main site footer', () => {
  for (const p of mainPages) {
    test(`${p.path} footer`, async ({ page }, testInfo) => {
      const mobile = testInfo.project.name === 'mobile';
      await page.goto(p.url, { waitUntil: 'load' });
      // The site ships three copies of the footer, one per responsive variant,
      // and only one is visible. Scroll the visible one: a locator would block
      // on a hidden copy until the test times out.
      await page.evaluate((sel) => {
        const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null);
        if (el) el.scrollIntoView({ block: 'center' });
      }, ICONS);
      await page.waitForTimeout(300); // let any reveal animation settle

      const socials = await visibleSocials(page);
      expect(socials, `${p.path}: no visible social row`).not.toBeNull();

      // All four accounts, exactly once each.
      expect(socials.length, `${p.path}: expected 4 social icons`).toBe(4);
      for (const [name, fragment] of Object.entries(SOCIALS)) {
        const n = socials.filter((s) => s.href.includes(fragment)).length;
        expect(n, `${p.path}: expected exactly one ${name} icon, found ${n}`).toBe(1);
      }

      // One line, always. This is the check that would have caught the 2x2 block.
      expect(new Set(socials.map((s) => s.top)).size, `${p.path}: social icons are not on one line`).toBe(1);

      // The tagline sits above the icons in both languages.
      const yTag = await topOf(page, TAGLINE);
      const yIcons = await topOf(page, ICONS);
      expect(yTag, `${p.path}: tagline missing`).not.toBeNull();
      expect(yTag, `${p.path}: tagline is not above the social icons`).toBeLessThan(yIcons);

      // Exactly one Break the Loop link is ever visible: the phone layout adds
      // a standalone copy and hides the inline one, and both showing would be a bug.
      const btlVisible = await page.locator(BTL).evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
      expect(btlVisible, `${p.path}: expected exactly one visible Break the Loop link`).toBe(1);

      const yBtl = await topOf(page, BTL);
      const yLegal = await topOf(page, LEGAL);
      const yCopy = await topOf(page, COPYRIGHT);

      if (mobile) {
        // Stack: icons, then the link on its own line, then legal, then copyright.
        expect(yBtl, `${p.path}: Break the Loop link is not below the icons`).toBeGreaterThan(yIcons);
        expect(yBtl, `${p.path}: Break the Loop link is not above the legal links`).toBeLessThan(yLegal);
        expect(yLegal, `${p.path}: legal links are not above the copyright`).toBeLessThan(yCopy);

        const sharesLine = await page.evaluate(([b, l]) => {
          const vis = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
          const btl = vis(b)[0];
          if (!btl) return false;
          const t = Math.round(btl.getBoundingClientRect().top);
          return vis(l).some((e) => Math.round(e.getBoundingClientRect().top) === t);
        }, [BTL, LEGAL]);
        expect(sharesLine, `${p.path}: Break the Loop link is sharing a line with the legal links`).toBe(false);

        // Circles are shrunk to fit four across.
        expect(socials[0].width, `${p.path}: phone circles should be smaller than desktop`).toBeLessThan(100);
        expect(socials[0].width, `${p.path}: phone circles are too small to tap`).toBeGreaterThanOrEqual(44);
      } else {
        // Desktop is deliberately unchanged: full size circles, link still inline.
        expect(socials[0].width, `${p.path}: desktop circles should still be 100px`).toBe(100);
        const isStandalone = await page.evaluate((sel) => {
          const a = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null);
          return !!a && a.parentElement.className === 'btl-standalone';
        }, BTL);
        expect(isStandalone, `${p.path}: desktop is showing the phone-only copy of the link`).toBe(false);
      }

      expect(await horizontalOverflow(page), `${p.path}: page scrolls sideways`).toBe(0);
    });
  }
});

test.describe('landing page footer', () => {
  for (const p of landingPages) {
    test('breaktheloop footer', async ({ page }, testInfo) => {
      const mobile = testInfo.project.name === 'mobile';
      await page.goto(p.url, { waitUntil: 'load' });
      await page.locator('ul.social').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const icons = await page.evaluate(() =>
        [...document.querySelectorAll('ul.social a')].map((a) => ({
          href: a.getAttribute('href'),
          top: Math.round(a.getBoundingClientRect().top),
        }))
      );
      expect(icons.length, 'landing: expected 4 social icons').toBe(4);
      for (const [name, fragment] of Object.entries(SOCIALS)) {
        expect(icons.filter((i) => i.href.includes(fragment)).length, `landing: missing ${name}`).toBe(1);
      }
      expect(new Set(icons.map((i) => i.top)).size, 'landing: social icons wrapped').toBe(1);

      const nav = await page.evaluate(() =>
        [...document.querySelectorAll('.footer__nav a')].map((a) => ({
          href: a.getAttribute('href'),
          top: Math.round(a.getBoundingClientRect().top),
        }))
      );
      const rows = [...new Set(nav.map((n) => n.top))].sort((a, b) => a - b);

      if (mobile) {
        // The link to the main site gets a line of its own, then the three legal links.
        expect(rows.length, 'landing phone: footer nav should be two rows').toBe(2);
        const first = nav.filter((n) => n.top === rows[0]);
        expect(first.length, 'landing phone: first nav row should hold only the website link').toBe(1);
        expect(first[0].href, 'landing phone: first nav row is not the website link').toContain('yaelfried.com');
        expect(nav.filter((n) => n.top === rows[1]).length, 'landing phone: legal links should share one row').toBe(3);
        expect(rows[0], 'landing phone: nav is not below the icons').toBeGreaterThan(icons[0].top);
      } else {
        expect(rows.length, 'landing desktop: footer nav should stay on one row').toBe(1);
      }

      expect(await horizontalOverflow(page), 'landing: page scrolls sideways').toBe(0);
    });
  }
});

test.describe('links page', () => {
  for (const p of linksPages) {
    test('links page social row', async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });
      await page.waitForSelector('#social a');

      const icons = await page.evaluate(() =>
        [...document.querySelectorAll('#social a')].map((a) => ({
          href: a.getAttribute('href'),
          label: a.getAttribute('aria-label'),
          top: Math.round(a.getBoundingClientRect().top),
        }))
      );
      expect(icons.length, 'links: expected 4 social icons').toBe(4);
      for (const [name, fragment] of Object.entries(SOCIALS)) {
        expect(icons.filter((i) => i.href.includes(fragment)).length, `links: missing ${name}`).toBe(1);
      }
      expect(new Set(icons.map((i) => i.top)).size, 'links: social icons wrapped').toBe(1);
      expect(icons.every((i) => i.label && i.label.trim()), 'links: a social icon has no accessible label').toBe(true);

      // The row is labelled, and the label does not ask for a follow: nearly
      // everyone here arrived from one of those profiles already.
      const label = (await page.locator('#social-label').textContent()).trim();
      expect(label.length, 'links: social row label is empty').toBeGreaterThan(0);

      // Icons render, rather than being empty boxes.
      const drawn = await page.evaluate(() =>
        [...document.querySelectorAll('#social a svg path')].every((p) => {
          try { return p.getBBox().width > 0; } catch { return false; }
        })
      );
      expect(drawn, 'links: a social icon glyph is not drawing').toBe(true);

      expect(await horizontalOverflow(page), 'links: page scrolls sideways').toBe(0);
    });
  }
});
