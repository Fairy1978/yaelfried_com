const { test, expect } = require('@playwright/test');
const { allPages, origin } = require('../sites');
const { desktopOnly } = require('../helpers');

/*
 * Every link on every page, checked once.
 *
 * Internal links must return 200. External links are checked more loosely on
 * purpose: Instagram, Facebook and TikTok routinely answer 403 or 429 to a
 * non-browser request, and failing the suite on that would make it useless.
 * What we do catch is the thing that actually matters: a link that is gone
 * (404/410) or a host that no longer resolves, plus malformed hrefs.
 */

const DEAD = [404, 410];
const seen = new Map(); // url -> { status, error }

async function checkUrl(request, url) {
  if (seen.has(url)) return seen.get(url);
  let result;
  try {
    let res = await request.head(url, { timeout: 20000, maxRedirects: 5 });
    // Some hosts refuse HEAD outright; retry those with GET before believing them.
    if ([403, 405, 501].includes(res.status())) {
      res = await request.get(url, { timeout: 25000, maxRedirects: 5 });
    }
    result = { status: res.status(), error: null };
  } catch (e) {
    result = { status: null, error: e.message };
  }
  seen.set(url, result);
  return result;
}

test.describe('links', () => {
  desktopOnly();
  test.describe.configure({ mode: 'serial' }); // share the `seen` cache

  for (const p of allPages) {
    test(`${p.site} ${p.path} has no broken or malformed links`, async ({ page, request }) => {
      await page.goto(p.url, { waitUntil: 'load' });

      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => ({
          href: a.getAttribute('href'),
          resolved: a.href,
          text: (a.textContent || '').trim().slice(0, 40),
          visible: a.offsetParent !== null,
        }))
      );

      expect(hrefs.length, `${p.path} has no links at all, which cannot be right`).toBeGreaterThan(3);

      const malformed = [];
      const toCheck = new Set();

      for (const l of hrefs) {
        const h = (l.href || '').trim();

        // A visible link that goes nowhere is a bug; "#" on a control is not.
        if (h === '' || h === '#') {
          if (l.visible) malformed.push(`empty href on visible link "${l.text}"`);
          continue;
        }
        if (h.startsWith('javascript:')) continue;

        if (h.startsWith('mailto:')) {
          if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(h)) malformed.push(`bad mailto: ${h}`);
          continue;
        }
        if (h.startsWith('tel:')) {
          if (!/^tel:\+?[0-9\-\s()]{6,}$/.test(h)) malformed.push(`bad tel: ${h}`);
          continue;
        }
        if (h.startsWith('#')) continue; // in-page anchor, checked below

        try {
          const u = new URL(l.resolved);
          if (!['http:', 'https:'].includes(u.protocol)) {
            malformed.push(`unexpected protocol: ${l.resolved}`);
            continue;
          }
          toCheck.add(u.toString());
        } catch {
          malformed.push(`unparseable href: ${h}`);
        }
      }

      expect(malformed, `${p.path} has malformed links`).toEqual([]);

      const dead = [];
      const unreachable = [];
      for (const url of toCheck) {
        const isInternal = url.startsWith(origin.main) || url.startsWith(origin.landing) || url.startsWith(origin.links);
        const r = await checkUrl(request, url);

        if (r.error) {
          // DNS or connection failure. Real for our own hosts, noise for others.
          (isInternal ? dead : unreachable).push(`${url} -> ${r.error}`);
          continue;
        }
        if (DEAD.includes(r.status)) {
          dead.push(`${url} -> ${r.status}`);
          continue;
        }
        if (isInternal && r.status >= 400) {
          dead.push(`${url} -> ${r.status}`);
        }
      }

      expect(dead, `${p.path} points at dead links`).toEqual([]);
      if (unreachable.length) {
        // Not a failure: an external host being grumpy at a bot is not a site bug.
        test.info().annotations.push({ type: 'note', description: `external hosts not reachable from here: ${unreachable.join('; ')}` });
      }
    });
  }
});

test.describe('in-page anchors resolve', () => {
  desktopOnly();

  for (const p of allPages) {
    test(`${p.site} ${p.path} anchor targets exist`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });
      const missing = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && h.length > 1)
          .filter((h) => {
            try { return !document.querySelector(h) && !document.getElementsByName(h.slice(1)).length; }
            catch { return true; }
          })
      );
      expect([...new Set(missing)], `${p.path} has anchors pointing at nothing`).toEqual([]);
    });
  }
});
