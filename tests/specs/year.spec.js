const { test, expect } = require('@playwright/test');
const { allPages } = require('../sites');
const { desktopOnly } = require('../helpers');

/*
 * The footer year has to roll over by itself.
 *
 * All three properties print "2024-<current year>" from
 * new Date().getFullYear() so that nobody has to remember to edit fourteen
 * pages every January. Nothing proved that promise held: a rebuild that
 * dropped the script, or a boundary bug, would leave the wrong year sitting
 * in the footer for months before anyone happened to look.
 *
 * These tests move the browser's clock rather than wait for January. The fake
 * time is set BEFORE the page loads, so the script sees it the first time it
 * runs, which is the only run that matters.
 *
 * The start year is deliberately 2024 - the year the business started - so it
 * is asserted as a literal here on purpose.
 */

/* Where the year is printed on each property. */
const COPYRIGHT = {
  main: '.copyright-year',
  landing: '.copyright-year',
  links: '#footer',
};

/*
 * getFullYear() answers in the visitor's own timezone, so the interesting
 * moments are local midnights. Pinning the timezone makes the boundary cases
 * below mean the same thing on any machine and in CI.
 */
test.use({ timezoneId: 'Asia/Jerusalem' });

/* One page of each property, for the checks that only exercise shared logic. */
const representative = ['main', 'landing', 'links'].map(
  (site) => allPages.find((p) => p.site === site),
);

/*
 * setFixedTime, not install: it fakes the date without pausing timers, so the
 * page's own animations and deferred scripts still run normally and the page
 * loads the way a visitor's would.
 */
async function loadAt(page, target, isoInstant) {
  await page.clock.setFixedTime(new Date(isoInstant));
  await page.goto(target.url, { waitUntil: 'load' });
}

async function footerYear(page, site) {
  const el = page.locator(COPYRIGHT[site]).filter({ visible: true }).first();
  const text = await el.innerText();
  const hit = text.match(/2024\s*[-–]\s*(\d{4})/);
  expect(hit, `no "2024-<year>" found in the footer; it reads: ${JSON.stringify(text)}`)
    .not.toBeNull();
  return { year: Number(hit[1]), text };
}

test.describe('the footer year rolls over on its own', () => {
  desktopOnly();

  /*
   * Every page, with the clock a long way forward. One load per page proves
   * two things at once: the page still carries the script, and the year it
   * prints comes from the clock rather than from a number typed into the HTML.
   */
  for (const p of allPages) {
    test(`${p.site}${p.path} reads the clock, not a hardcoded year`, async ({ page }) => {
      await loadAt(page, p, '2033-06-15T09:00:00Z');
      const { year } = await footerYear(page, p.site);
      expect(year, `${p.site}${p.path}: the footer year did not follow the clock`).toBe(2033);
    });
  }

  /* Today, unfaked - the footer a real visitor is seeing right now. */
  for (const p of allPages) {
    test(`${p.site}${p.path} shows the current year today`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });
      const { year } = await footerYear(page, p.site);
      expect(year, `${p.site}${p.path}: the footer is not showing this year`)
        .toBe(new Date().getFullYear());
    });
  }

  /*
   * The two sides of a New Year's Eve in Israel, one minute apart. The late
   * side is the one that catches a UTC-vs-local mistake: at 23:59 on the 31st
   * it is already the next year in UTC, and a footer that jumps early is as
   * wrong as one that never jumps.
   */
  for (const p of representative) {
    test(`${p.site} still says 2026 one minute before midnight`, async ({ page }) => {
      await loadAt(page, p, '2026-12-31T21:59:00Z'); // 23:59 in Jerusalem, still 2026
      const { year } = await footerYear(page, p.site);
      expect(year, `${p.site}: the year jumped before local midnight`).toBe(2026);
    });

    test(`${p.site} says 2027 one minute after midnight`, async ({ page }) => {
      await loadAt(page, p, '2026-12-31T22:01:00Z'); // 00:01 on 1 Jan in Jerusalem
      const { year } = await footerYear(page, p.site);
      expect(year, `${p.site}: the year did not roll over at local midnight`).toBe(2027);
    });

    /*
     * A visitor who leaves the tab open across midnight. The scripts only run
     * on load, so this is expected to still read the old year - it is pinned
     * here so that the limit is a known one rather than a surprise.
     */
    test(`${p.site} keeps the loaded year on an already-open tab`, async ({ page }) => {
      await loadAt(page, p, '2026-12-31T21:59:00Z');
      expect((await footerYear(page, p.site)).year).toBe(2026);
      await page.clock.setFixedTime(new Date('2026-12-31T22:01:00Z'));
      await page.waitForTimeout(1500);
      expect((await footerYear(page, p.site)).year,
        `${p.site}: an open tab changed its footer year without a reload`).toBe(2026);
    });
  }
});
