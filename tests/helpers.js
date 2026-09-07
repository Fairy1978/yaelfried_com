const { test } = require('@playwright/test');

/* Skip a spec on every project but desktop. Use for checks whose outcome
 * cannot depend on viewport size, so they run once instead of twice. */
function desktopOnly() {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop',
      'viewport-independent check, runs once on desktop');
  });
}

/*
 * Block every outbound form submission for the whole page.
 *
 * The forms post to Formspree with fetch(). We want to prove the wiring is
 * right without ever creating a real lead, so the request is captured and
 * aborted. Returns an array that fills with the captured requests.
 */
async function interceptFormPosts(page) {
  const captured = [];
  await page.route('**://formspree.io/**', async (route) => {
    const req = route.request();
    let body = null;
    try { body = req.postData(); } catch { /* multipart bodies may not stringify */ }
    captured.push({ url: req.url(), method: req.method(), body });
    await route.abort();
  });
  return captured;
}

/* Collect page errors and console errors while a page loads. */
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  return errors;
}

/*
 * Third-party noise we do not control and that does not indicate the site is
 * broken: the accessibility vendor, analytics and pixels. Failing the suite on
 * these would mean it cries wolf every time one of those services hiccups.
 */
const IGNORABLE_ERROR = /enable\.co\.il|facebook\.net|fbevents|connect\.facebook|vercel|analytics|gtag|googletagmanager|ERR_BLOCKED_BY_CLIENT|Failed to load resource: the server responded with a status of 4\d\d \(\)/i;

function realErrors(errors) {
  return errors.filter((e) => !IGNORABLE_ERROR.test(e));
}

/* True when the document scrolls sideways, which is always a layout bug. */
async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return Math.max(0, Math.max(document.body.scrollWidth, de.scrollWidth) - de.clientWidth);
  });
}

/* Vertical position of the first match, or null. Used to assert stacking
 * order in footers without depending on DOM order, which differs between
 * the Hebrew and English builds of the main site. */
async function topOf(page, selector) {
  return page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
    if (!els.length) return null;
    return Math.min(...els.map((e) => Math.round(e.getBoundingClientRect().top)));
  }, selector);
}

/* How many distinct rows a set of elements occupies. 1 means "all on one line". */
async function lineCount(page, selector) {
  return page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
    return new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size;
  }, selector);
}

module.exports = {
  desktopOnly,
  interceptFormPosts,
  collectErrors,
  realErrors,
  horizontalOverflow,
  topOf,
  lineCount,
};
