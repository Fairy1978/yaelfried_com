# Regression tests

Automated checks for all three properties, so nobody has to click through
fourteen pages in two languages on two devices after every change.

| Site | Pages |
|---|---|
| yaelfried.com | 12 (6 Hebrew, 6 English) |
| breaktheloop.yaelfried.com | 1 |
| links.yaelfried.com | 1 |

## Running them

```bash
cd tests
npm test
```

That is the whole thing. It takes about three minutes and tests the **live**
sites. A green run means nothing on any of the three is broken.

To see a browsable report of the last run:

```bash
npm run report
```

To test local copies instead of the live sites, serve each one and set
`TARGET=local`:

```bash
# three terminals, or run them in the background
python -m http.server 8801 --directory /path/to/yaelfried_com
python -m http.server 8802 --directory /path/to/landing-page
python -m http.server 8803 --directory /path/to/yaelfried-links

TARGET=local npx playwright test        # bash
$env:TARGET="local"; npx playwright test  # PowerShell
```

## What is covered

**Every page** (`specs/pages.spec.js`)
- returns 200
- has a title and a meta description
- declares the right language
- every JSON-LD block parses (a stray comma here quietly costs rich results)
- no broken images
- no JavaScript errors from our own code
- offers a route into the other language
- still carries the accessibility widget, and its licensed script URL resolves

**Every link** (`specs/links.spec.js`)
- no 404s anywhere, internal or external
- no empty, malformed or unparseable hrefs on visible links
- mailto: and tel: links are well formed
- in-page anchors point at something that exists

**Footers** (`specs/footer.spec.js`), at phone and desktop size
- all four social icons present, one of each, on a single line
- the tagline sits above the icons in both languages
- phone: Break the Loop on its own line, above the legal links, above the copyright
- desktop: unchanged, 100px circles, link still inline
- landing page: website link on its own line, three legal links together
- links page: four icons, labelled, glyphs actually drawing

**Layout** (`specs/layout.spec.js`)
- nothing scrolls sideways at 320, 360, 375, 390, 414, 600, 810, 1024, 1280 or 1440
- the links page still fits one screen on real device sizes

**Forms** (`specs/forms.spec.js`)
- all four contact forms exist, with name, phone, email and message
- required fields are actually required
- the contact-page modal still opens (its form is unreachable otherwise)
- the spam honeypot exists and stays hidden
- pressing submit really does POST to the right Formspree endpoint, carrying
  what was typed
- an empty form does not submit
- every WhatsApp link carries a valid number

### Nothing is ever really submitted

Every request to formspree.io is intercepted and aborted. No test lead ever
reaches the inbox and no Formspree quota is spent, while still proving the
submission is wired up correctly.

## Known issues this suite records

**The landing page accepts a lead with no email address.** The email box has no
`required` attribute and the script only checks the format of an email that was
actually typed, so a lead can arrive with a name and phone but no email. The
error message for it exists in the page but never displays, which suggests
requiring it was the original intent. This is *pinned* by a test rather than
fixed, because whether to require an email is a business decision: requiring it
means fewer but more contactable leads. See the comment on
`email is currently optional` in `specs/forms.spec.js`.

**The language toggle goes to the homepage, not the matching page.** From
`/about-he`, "EN" lands on `/home-en` rather than `/about`. The suite asserts
only that a route into the other language exists. If the toggle is ever made
page-to-page, tighten that test to use each page's `alt`.

**The links page is ~23px too tall on a 320x568 screen** (the original iPhone
SE). Pre-existing: the version from before the TikTok icon measured identically.
The test allows up to 40px there so it cannot quietly get worse.

## Notes for whoever edits these

- The suite drives the Chrome already installed on the machine
  (`channel: 'chrome'`), because this network blocks Playwright's own browser
  download. If it ever runs somewhere else, `npx playwright install chromium`
  and drop the `channel` line.
- **The main site ships three copies of every footer**, one per responsive
  variant, and only one is visible. Always find the visible one
  (`offsetParent !== null`) rather than using `.first()`, which will pick a
  hidden copy and hang until the test times out.
- **The Hebrew and English builds order the footer differently** in the markup.
  Assert vertical order with `getBoundingClientRect().top`, never DOM order.
- **The Enable accessibility widget does not initialise in headless Chrome** at
  all. Do not assert its button renders; assert the script tag and URL.
- Adding a page? Add it to `sites.js` and every relevant spec picks it up.
