// Bing Webmaster Tools verifies breaktheloop through this meta tag; removing it
// unverifies the site in Bing, which is where ChatGPT search finds it.
const { test, expect } = require('@playwright/test');

const LANDING = process.env.TARGET === 'local' ? 'http://localhost:8802' : 'https://breaktheloop.yaelfried.com';

test('landing page carries the Bing verification tag', async ({ request }) => {
  const res = await request.get(LANDING + '/');
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  expect(html).toContain('<meta name="msvalidate.01" content="C6120DDFB60F082709F96C8CA6B27D68">');
});
