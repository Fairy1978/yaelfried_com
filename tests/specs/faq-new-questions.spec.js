// The two homepage questions approved on 2026-10-24 open the FAQ in both
// languages, visibly and in the FAQ code. The Hebrew contact description
// leaves out Zoom (her call: she explains Zoom on the intro call).
const { test, expect } = require('@playwright/test');

const MAIN = process.env.TARGET === 'local' ? 'http://localhost:8801' : 'https://yaelfried.com';

const PAGES = {
  '/': ['מה זה טיפול בתת מודע?', 'איך משנים דפוס שחוזר על עצמו?'],
  '/home-en': ['What Is Subconscious Therapy?', 'How Do I Change a Pattern That Keeps Repeating?'],
};

for (const [path, questions] of Object.entries(PAGES)) {
  test(`${path} opens its FAQ with the two approved questions`, async ({ request }) => {
    const html = await (await request.get(MAIN + path)).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .find((d) => d['@type'] === 'FAQPage');
    expect(faq.mainEntity.slice(0, 2).map((q) => q.name)).toEqual(questions);
    const firstShown = [...html.matchAll(/data-framer-name="Question">[\s\S]*?<p class="framer-text"[^>]*>(.*?)<\/p>/g)]
      .slice(0, 2).map((m) => m[1].replace(/^\?/, '').replace(/\?$/, ''));
    expect(firstShown).toEqual(questions.map((q) => q.replace(/\?$/, '')));
  });
}

// Her call (2026-10-24): Zoom stays in the Google description, and is
// off the visible contact pages; she explains it on the intro call.
for (const [path, sentence] of [['/contact-he', 'המפגשים מתקיימים בזום.'], ['/contact', 'Sessions are held online via Zoom.']]) {
  test(`${path} keeps Zoom off the visible page`, async ({ request }) => {
    const html = await (await request.get(MAIN + path)).text();
    expect(html).not.toContain(`>${sentence}</p>`);
  });
}

test('Hebrew contact Google description still mentions Zoom', async ({ request }) => {
  const html = await (await request.get(MAIN + '/contact-he')).text();
  const metas = html.match(/<meta[^>]*>/g).join('\n');
  expect(metas).toContain('המפגשים מתקיימים בזום.');
});
