// The search titles approved on 2026-10-24, one main phrase per page.
// The tab title, og:title and twitter:title must all carry the same text.
const { test, expect } = require('@playwright/test');

const MAIN = process.env.TARGET === 'local' ? 'http://localhost:8801' : 'https://yaelfried.com';

const TITLES = {
  '/': 'טיפול בתת מודע בטראנס וסוגסטיה | יעל פריד',
  '/trace-suggestion-he': 'מה זה טיפול בטראנס ואיך זה עובד | יעל פריד',
  '/process-he': 'שינוי דפוסים ב-5 מפגשים: איך נראה התהליך | יעל פריד',
  '/treatment-he': 'טיפול רגשי בזום דרך תת המודע | יעל פריד',
  '/home-en': 'Subconscious Therapy Online with Trance | Yael Fried',
  '/trace-suggestion': 'What Is Trance Therapy and How It Works | Yael Fried',
  '/process': 'Five Sessions to Break Negative Patterns | Yael Fried',
  '/treatment': 'Subconscious Healing for Emotional Reactions | Yael Fried',
};

for (const [path, title] of Object.entries(TITLES)) {
  test(`${path} carries its approved search title`, async ({ request }) => {
    const html = await (await request.get(MAIN + path)).text();
    expect(html).toContain(`<title>${title}</title>`);
    expect(html.split(title).length - 1, 'title, og:title and twitter:title').toBe(3);
  });
}
