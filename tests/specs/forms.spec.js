const { test, expect } = require('@playwright/test');
const { mainPages, landingPages, FORM_ENDPOINTS } = require('../sites');
const { desktopOnly, interceptFormPosts } = require('../helpers');

/*
 * The contact forms.
 *
 * IMPORTANT: these tests never deliver a real submission. Every request to
 * formspree.io is intercepted and aborted, so nothing reaches the inbox and no
 * Formspree quota is spent. What is proven is the part that actually breaks:
 * the fields exist, they are required, and pressing submit really does fire a
 * POST at the right endpoint carrying the values that were typed.
 *
 * There are two different form implementations on the main site and the field
 * NAMES differ between them, so everything here is located by input type and
 * position rather than by name:
 *   - the two homepages use Framer's own form ("Name", "phone number",
 *     "What is your email?")
 *   - the two contact pages use a hand-written form (name, phone, email)
 *     which also carries a _gotcha spam honeypot the homepages do not have.
 */

const FILL = {
  name: 'Playwright Test',
  phone: '0500000000',
  email: 'test@example.com',
  message: 'automated regression test, not a real enquiry',
};

/* The visible form that contains an email field, whatever it is called. */
function contactForm(page) {
  return page.locator('form').filter({ has: page.locator('input[type="email"]') }).first();
}

const HAS_HONEYPOT = ['/contact', '/contact-he'];

/*
 * The two contact pages keep their form in a modal that only opens when the
 * "book a session" call to action is clicked; the two homepages show their
 * form inline. Opening the modal is therefore part of reaching the form, and
 * is itself worth testing: if the trigger ever stops opening it, nobody can
 * contact her from the contact page at all.
 */
const MODAL_TRIGGER = {
  '/contact': 'BOOK SESSION',
  '/contact-he': 'קביעת מפגש',
};

async function openFormIfModal(page, path) {
  const label = MODAL_TRIGGER[path];
  if (!label) return false;
  const opened = await page.evaluate((text) => {
    const trigger = [...document.querySelectorAll('*')]
      .find((e) => e.children.length === 0 && e.textContent.trim() === text);
    if (!trigger) return false;
    (trigger.closest('a') || trigger.closest('[tabindex]') || trigger).click();
    return true;
  }, label);
  await page.waitForTimeout(600);
  return opened;
}

test.describe('main site contact form', () => {
  desktopOnly();

  const pagesWithForms = mainPages.filter((p) => p.form);

  for (const p of pagesWithForms) {
    test(`${p.path} form is present and correctly built`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });

      const isModal = !!MODAL_TRIGGER[p.path];
      if (isModal) {
        const opened = await openFormIfModal(page, p.path);
        expect(opened, `${p.path}: the "book a session" trigger that opens the form is gone`).toBe(true);
      }

      const form = contactForm(page);
      await expect(form, `${p.path}: no contact form found`).toHaveCount(1);

      // One of each field type, so phones raise the right keyboard and the
      // browser validates before anything is sent.
      const text = form.locator('input[type="text"]:not([aria-hidden="true"])').first();
      const tel = form.locator('input[type="tel"]').first();
      const email = form.locator('input[type="email"]').first();

      await expect(text, `${p.path}: no name field`).toBeVisible();
      await expect(tel, `${p.path}: no phone field`).toBeVisible();
      await expect(email, `${p.path}: no email field`).toBeVisible();
      await expect(form.locator('textarea').first(), `${p.path}: no message field`).toBeVisible();

      for (const [label, loc] of [['name', text], ['phone', tel], ['email', email]]) {
        await expect(loc, `${p.path}: the ${label} field is not required`).toHaveAttribute('required', /.*/);
      }

      await expect(form.locator('button[type="submit"], input[type="submit"]').first(),
        `${p.path}: no submit button`).toBeVisible();

      // Where a spam honeypot exists it must stay invisible to real visitors.
      if (HAS_HONEYPOT.includes(p.path)) {
        const honeypot = form.locator('[name="_gotcha"]');
        await expect(honeypot, `${p.path}: the spam honeypot field is gone`).toHaveCount(1);
        await expect(honeypot, `${p.path}: the honeypot is visible to real visitors`).toBeHidden();
      }
    });

    test(`${p.path} form submits to Formspree with what was typed`, async ({ page }) => {
      const captured = await interceptFormPosts(page);
      await page.goto(p.url, { waitUntil: 'load' });
      await openFormIfModal(page, p.path);

      const form = contactForm(page);
      await form.locator('input[type="text"]:not([aria-hidden="true"])').first().fill(FILL.name);
      await form.locator('input[type="tel"]').first().fill(FILL.phone);
      await form.locator('input[type="email"]').first().fill(FILL.email);
      await form.locator('textarea').first().fill(FILL.message);

      await form.locator('button[type="submit"], input[type="submit"]').first().click();
      await page.waitForTimeout(3000);

      expect(captured.length, `${p.path}: pressing submit sent nothing to Formspree`).toBeGreaterThan(0);
      expect(captured[0].method, `${p.path}: form is not POSTing`).toBe('POST');
      expect(captured[0].url, `${p.path}: form posts to the wrong endpoint`)
        .toContain(FORM_ENDPOINTS.main.split('/f/')[1]);

      if (captured[0].body) {
        expect(captured[0].body, `${p.path}: the email typed did not reach the payload`).toContain(FILL.email);
      }
    });

    test(`${p.path} form refuses to submit when empty`, async ({ page }) => {
      const captured = await interceptFormPosts(page);
      await page.goto(p.url, { waitUntil: 'load' });
      await openFormIfModal(page, p.path);

      const form = contactForm(page);
      await form.locator('button[type="submit"], input[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      expect(captured.length,
        `${p.path}: an empty form was submitted, required fields are not being enforced`).toBe(0);
    });
  }
});

test.describe('landing page lead form', () => {
  desktopOnly();

  for (const p of landingPages) {
    test('form is present and correctly built', async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'load' });

      const form = page.locator('#leadForm');
      await expect(form, 'landing: #leadForm is missing').toHaveCount(1);

      // Name and phone are required. Email deliberately is NOT asserted as
      // required here, because today it is not: see the pinned test below.
      for (const field of ['firstName', 'phone']) {
        const input = form.locator(`[name="${field}"]`);
        await expect(input, `landing: missing the ${field} field`).toHaveCount(1);
        await expect(input, `landing: the ${field} field is not required`).toHaveAttribute('required', /.*/);
      }
      await expect(form.locator('[name="email"]'), 'landing: missing the email field').toHaveCount(1);
      await expect(form.locator('[name="message"]'), 'landing: missing the message field').toHaveCount(1);
      await expect(form.locator('[name="consent"]'), 'landing: missing the consent checkbox').toHaveCount(1);
      await expect(form.locator('#submitBtn'), 'landing: no submit button').toBeVisible();
    });

    test('form submits to Formspree with what was typed', async ({ page }) => {
      const captured = await interceptFormPosts(page);
      await page.goto(p.url, { waitUntil: 'load' });

      const form = page.locator('#leadForm');
      await form.locator('[name="firstName"]').fill(FILL.name);
      await form.locator('[name="phone"]').fill(FILL.phone);
      await form.locator('[name="email"]').fill(FILL.email);
      await form.locator('[name="message"]').fill(FILL.message);
      await form.locator('#submitBtn').click();
      await page.waitForTimeout(3000);

      expect(captured.length, 'landing: pressing submit sent nothing to Formspree').toBeGreaterThan(0);
      expect(captured[0].method, 'landing: form is not POSTing').toBe('POST');
      expect(captured[0].url, 'landing: form posts to the wrong endpoint')
        .toContain(FORM_ENDPOINTS.landing.split('/f/')[1]);
      if (captured[0].body) {
        expect(captured[0].body, 'landing: the email typed did not reach the payload').toContain(FILL.email);
      }
    });

    /*
     * PINNED BEHAVIOUR, NOT AN ENDORSEMENT.
     *
     * The landing form currently accepts a submission with the email box left
     * completely empty: the input carries no `required` attribute and the
     * script only checks the format of an email that was actually typed. The
     * error element and its message exist but never display, which suggests
     * requiring it was the intent.
     *
     * The practical effect is that a lead can arrive with a name and a phone
     * number but no email address.
     *
     * This is pinned as-is rather than "fixed" because whether email should be
     * mandatory is a business decision: requiring it means fewer, more
     * contactable leads. Flip this test the moment that decision is made.
     */
    test('email is currently optional (pinned, see comment)', async ({ page }) => {
      const captured = await interceptFormPosts(page);
      await page.goto(p.url, { waitUntil: 'load' });

      const form = page.locator('#leadForm');
      await form.locator('[name="firstName"]').fill(FILL.name);
      await form.locator('[name="phone"]').fill(FILL.phone);
      await form.locator('#submitBtn').click();
      await page.waitForTimeout(2500);

      expect(captured.length,
        'landing: the empty-email submission no longer goes through. If email was ' +
        'deliberately made required, update this test to expect 0.').toBeGreaterThan(0);
    });

    test('form refuses an invalid email', async ({ page }) => {
      const captured = await interceptFormPosts(page);
      await page.goto(p.url, { waitUntil: 'load' });

      const form = page.locator('#leadForm');
      await form.locator('[name="firstName"]').fill(FILL.name);
      await form.locator('[name="phone"]').fill(FILL.phone);
      await form.locator('[name="email"]').fill('not-an-email');
      await form.locator('#submitBtn').click();
      await page.waitForTimeout(2000);

      expect(captured.length, 'landing: an invalid email was submitted').toBe(0);
    });
  }
});

test.describe('WhatsApp contact links', () => {
  desktopOnly();

  test('every WhatsApp link carries the right number', async ({ page }) => {
    const seen = [];
    for (const p of [...mainPages, ...landingPages]) {
      await page.goto(p.url, { waitUntil: 'domcontentloaded' });
      const links = await page.evaluate(() =>
        [...document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]')].map((a) => a.href)
      );
      for (const l of links) seen.push({ page: p.path, href: l });
    }
    expect(seen.length, 'no WhatsApp links found anywhere, which cannot be right').toBeGreaterThan(0);
    const wrong = seen.filter((s) => !/972\d{9}/.test(s.href));
    expect(wrong, 'a WhatsApp link does not carry a valid Israeli number').toEqual([]);
  });
});
