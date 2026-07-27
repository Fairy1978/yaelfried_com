# Footer copyright line: language, year, and name

**Date:** 2026-07-27
**Status:** Approved, not yet implemented
**Scope:** All four Yael Fried web properties

## Problem

The copyright line in the footer is wrong in three separate ways, and differently wrong on different sites.

Current state:

| Property | Current line | Language |
|---|---|---|
| yaelfried.com (all 12 pages) | `All rights reserved to Yael Fried - The Journey to Yourself © 2024` | English, including on Hebrew pages |
| links.yaelfried.com | `כל הזכויות שמורות ליעל פריד - המסע אל עצמך © 2024` | Hebrew |
| start.yaelfried.com | `© 2024 יעל פריד - המסע אל עצמך \| כל הזכויות שמורות` | Hebrew |
| breaktheloop.yaelfried.com | `כל הזכויות שמורות ליעל פריד` + `המסע אל עצמך` + `© 2024` | Hebrew |

Three problems:

1. **Language mismatch.** The main site shows an English copyright line on its six Hebrew pages. A Hebrew reader reaches the bottom of a fully Hebrew page and hits English.
2. **Stale year.** All four say 2024. It is 2026. A single past year reads as "this site has not been touched in two years," which is the opposite of the signal an active practice wants.
3. **Brand name in a legal line.** Three of the four carry "The Journey to Yourself" / "המסע אל עצמך". A copyright notice names the rights holder, not the brand. Yael's positioning already shifted once in July 2026, so any brand name in the footer becomes maintenance debt across 15 locations.

## Decisions

### 1. The line matches the language of the page it sits on

Hebrew pages get a Hebrew line. English pages get an English line. No page mixes.

Rejected: English everywhere (leaves Hebrew readers with foreign boilerplate on the primary-audience pages). Rejected: Hebrew everywhere (leaves English visitors with an unreadable line).

### 2. The year is a range, `2024-2026`, and the end year rolls over automatically

`© 2024` alone signals abandonment. `© 2026` alone signals a brand-new practice. The range signals both facts that are actually true: running since 2024, current today.

The start year 2024 is fixed and never changes. The end year tracks the current year.

### 3. The line names Yael only, not the brand

The rights holder is a person. The brand name belongs in the logo, the headline, and the page title, where changing it is a deliberate act rather than a footer edit.

This does **not** retire "המסע אל עצמך" from the sites. It still appears in page titles and on the links page. Retiring the name entirely is a separate project and explicitly out of scope here.

## The strings

**Hebrew** (21 copies across 9 pages):

```
כל הזכויות שמורות ליעל פריד © 2024-2026
```

**English** (18 copies across 6 pages):

```
© 2024-2026 Yael Fried. All rights reserved.
```

The copy counts exceed the page counts because the main site duplicates the line three times per page. See the scope table below.

## Scope: every location that changes

### yaelfried.com (repo `yaelfried_com`)

Each page carries **3 copies** of the copyright paragraph, one per responsive variant (desktop / tablet / mobile). All three must change together or they drift apart. This is the same duplication pattern that caused the earlier Framer variant bug.

The string also appears 3 times per page inside `data-framer-name` attributes. Those are Framer component labels, not visible text. **Leave them alone.**

| File | Language | Visible copies |
|---|---|---|
| `index.html` | Hebrew | 3 |
| `about-he.html` | Hebrew | 3 |
| `process-he.html` | Hebrew | 3 |
| `treatment-he.html` | Hebrew | 3 |
| `trace-suggestion-he.html` | Hebrew | 3 |
| `contact-he.html` | Hebrew | 3 |
| `home-en.html` | English | 3 |
| `about.html` | English | 3 |
| `process.html` | English | 3 |
| `treatment.html` | English | 3 |
| `trace-suggestion.html` | English | 3 |
| `contact.html` | English | 3 |

Subtotal: 36 visible copies, 18 Hebrew and 18 English.

### links.yaelfried.com (repo `yaelfried-links`)

`config.js` line 96, the `footer` string. Rendered by `main.js`. One location, Hebrew.

### start.yaelfried.com (repo `landing-page`)

`index.html` line 653, a single `<p>`. One location, Hebrew. Note the current line puts `©` first; the new line puts it last, matching the other Hebrew properties.

### breaktheloop.yaelfried.com (repo `yael-landing-page`, folder `landing-page/`)

`index.html` lines 419-424. The line is split across four elements:

```html
<p class="footer__copy">
  <span class="footer__name">כל הזכויות שמורות ליעל פריד</span>
  <span class="footer__sep" aria-hidden="true"></span>
  <span class="footer__tag">המסע אל עצמך</span>
  <span class="footer__year">© 2024</span>
</p>
```

Dropping the brand name means removing both `footer__tag` and `footer__sep`, leaving name plus year. `.footer__copy` is a flex row with a gap, so no dangling separator results. The now-unused `.footer__tag` and `.footer__sep` rules in `styles.css` (lines 972-976, and the mobile overrides at 1008-1011) should be cleaned up in the same change rather than left as dead CSS.

**Total: 39 visible locations across 4 repos.**

## Auto-rolling the year

The hardcoded HTML is the source of truth and must always read correctly on its own, with no JavaScript. That means `2024-2026` is literally written into every location. If scripts fail, are blocked, or a page is saved offline, the line is still correct.

On top of that, a one-line progressive enhancement updates the end year:

```html
<span class="copyright-year">2024-2026</span>
```

```js
document.querySelectorAll('.copyright-year')
  .forEach(el => { el.textContent = '2024-' + new Date().getFullYear(); });
```

This is additive. If it never runs, nothing breaks and the page shows the hardcoded range.

**Risk to verify during implementation:** the main site is a Framer export whose JavaScript hydrates the page from Framer's CDN. Framer's hydration may overwrite the footer text node and discard the injected span. This must be tested on the deployed page, not assumed. If hydration clobbers it, drop the script from the main site only and keep the hardcoded range there. The other three properties are hand-written HTML with no hydration and are not at risk.

On the links page the enhancement is free and carries no risk, because `config.js` is already JavaScript and the end year can be computed when the footer string is built.

## Out of scope

- Retiring "המסע אל עצמך" / "The Journey to Yourself" from page titles, headings, or the links page. Separate project.
- Any other footer content: social icons, legal page links, contact details.
- The legal pages (`privacy.html`, `terms.html`, `thanks.html`, `legal/`). Confirmed to contain no copyright line.

## Verification

For each of the four properties, after deploying:

1. Fetch the live page and confirm zero occurrences of `© 2024` standing alone, and zero occurrences of `The Journey to Yourself` or `המסע אל עצמך` inside the copyright line.
2. Confirm the Hebrew pages carry the Hebrew string and the English pages carry the English string, with no page carrying both.
3. On the main site, confirm all 3 responsive copies per page changed, by counting occurrences rather than eyeballing one.
4. Load breaktheloop in a real browser and confirm the footer still lays out on one line with no orphaned separator, at both desktop and mobile widths.
5. If the auto-roll script ships on the main site, confirm in a real browser that the rendered year survives Framer hydration.

Note on checking the live breaktheloop page: rapid scripted requests trigger Vercel's bot challenge and return 403, which looks like an outage but is not. Use a small number of requests, or verify in a browser.
