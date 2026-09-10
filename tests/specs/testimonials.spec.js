const { test, expect } = require('@playwright/test');
const { origin } = require('../sites');
const { desktopOnly } = require('../helpers');

/*
 * Testimonials are the only proof on these pages and they have gone missing
 * before, silently, when a section was reordered. Each check below pins one
 * screenshot or quote that is expensive to lose and impossible to notice.
 */
test.describe('testimonials stay where they were put', () => {
  desktopOnly();

  test('the Hebrew homepage still leads its row with the sleep and vitality screenshot', async ({ page }) => {
    await page.goto(`${origin.main}/`, { waitUntil: 'load' });

    const first = page.locator('.yf-testi-he-row .yf-testi-he-card').first().locator('img');
    await expect(first, 'the first card in the Hebrew row is not the sleep screenshot')
      .toHaveAttribute('src', /testimonial-sleep-energy-2026-09/);

    // Transcribed alt text is what Google and a screen reader actually read.
    const alt = await first.getAttribute('alt');
    expect(alt && alt.trim().length, 'the sleep screenshot lost its alt text').toBeGreaterThan(80);
  });

  test('the Hebrew homepage still opens with the featured screenshot', async ({ page }) => {
    await page.goto(`${origin.main}/`, { waitUntil: 'load' });
    await expect(page.locator('.yf-testi-he-feature img'))
      .toHaveAttribute('src', /testimonial-featured-2026-09/);
  });

  test('the English homepage still carries the sleep and vitality card first', async ({ page }) => {
    await page.goto(`${origin.main}/home-en`, { waitUntil: 'load' });

    const first = page.locator('.yf-testi-row .yf-testi-card').first();
    await expect(first.locator('.yf-testi-impact')).toHaveText(/Sleep and Vitality/i);
    await expect(first).toContainText(/slept wonderfully last night/i);
  });

  test('the landing page still shows all six testimonial images', async ({ page }) => {
    await page.goto(`${origin.landing}/`, { waitUntil: 'load' });

    for (const file of ['story-1', 'story-2', 'story-3', 'story-4', 'story-5', 'story-6', 'story-7']) {
      await expect(
        page.locator(`#testimonials img[src*="${file}"]`),
        `${file} is missing from the landing page testimonials`
      ).toHaveCount(1);
    }
  });

  test('the landing page keeps the new testimonial between driving and smoking', async ({ page }) => {
    await page.goto(`${origin.landing}/`, { waitUntil: 'load' });

    const order = await page.locator('#testimonials img').evaluateAll(
      imgs => imgs.map(i => i.getAttribute('src'))
    );
    const idx = name => order.findIndex(s => s.includes(name));
    expect(idx('story-4'), 'driving is missing').toBeGreaterThan(-1);
    expect(idx('story-7')).toBeGreaterThan(idx('story-4'));
    expect(idx('story-5')).toBeGreaterThan(idx('story-7'));
  });
});
