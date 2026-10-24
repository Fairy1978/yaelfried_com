// The homepage FAQ code is what Google and ChatGPT read. On 2026-10-24 two
// answers held testimonial-slider text and arrow symbols; keep them clean.
const { test, expect } = require('@playwright/test');

const MAIN = process.env.TARGET === 'local' ? 'http://localhost:8801' : 'https://yaelfried.com';
const BAD = ['&#8592;', '&#8594;', '←', '→', 'מה הלקוחות', 'What My Clients', 'שאלות נפוצות', '​'];

for (const path of ['/', '/home-en']) {
  test(`${path} FAQ answers carry no slider spill`, async ({ request }) => {
    const html = await (await request.get(MAIN + path)).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .filter((d) => d['@type'] === 'FAQPage');
    expect(blocks.length).toBe(1);
    for (const q of blocks[0].mainEntity) {
      for (const b of BAD) expect(q.acceptedAnswer.text, q.name).not.toContain(b);
    }
  });
}
