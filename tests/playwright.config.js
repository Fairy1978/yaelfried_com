const { defineConfig } = require('@playwright/test');
const { VIEWPORTS, TARGET } = require('./sites');

/*
 * Uses the Chrome already installed on this machine (channel: 'chrome')
 * rather than downloading Playwright's own build, which this network blocks.
 *
 * Two projects: every spec that depends on layout runs at both a phone and a
 * desktop size. Specs whose result cannot differ between the two (link
 * checking, head tags, form wiring) opt out via `desktopOnly` in helpers.js
 * so the suite does not do the same work twice.
 */
module.exports = defineConfig({
  testDir: './specs',
  fullyParallel: true,
  workers: 4,
  retries: TARGET === 'prod' ? 1 : 0, // a flaky network hop should not read as a regression
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    channel: 'chrome',
    headless: true,
    ignoreHTTPSErrors: false,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { viewport: VIEWPORTS.mobile, isMobile: false } },
    { name: 'desktop', use: { viewport: VIEWPORTS.desktop } },
  ],
});
