# yaelfried.com

Static website for Yael Fried, a trauma/anxiety therapist (trance & suggestion methods). Bilingual: Hebrew (default) and English.

## Background

This site was originally built and hosted on Framer (paid plan, ~29 NIS/month, paid yearly through December 2026). It was migrated to static HTML to move hosting to Vercel for free, since Framer doesn't support exporting sites for self-hosting.

## Deploy workflow

- This repo is connected to **Vercel** (project `yaelfried-com`, org `yael-f-projects`) for auto-deploy: every push to `main` on GitHub (`github.com/Fairy1978/yaelfried_com`) triggers a new Vercel production deploy.
- To make a change: edit the relevant `.html` file(s), `git add`, `git commit`, `git push`. No manual upload needed.
- `vercel.json` holds the clean-URL rewrite rules (Vercel's equivalent of the old `netlify.toml` redirects). `netlify.toml` and `.netlify/` are stale leftovers from an earlier abandoned Netlify attempt — not in active use.

## Site structure

12 static HTML pages, no CMS or backend — content is hardcoded directly into the HTML:

| Hebrew | English |
|---|---|
| `index.html` (home, `/`) | `home-en.html` (`/home-en`) |
| `trace-suggestion-he.html` | `trace-suggestion.html` |
| `about-he.html` | `about.html` |
| `process-he.html` | `process.html` |
| `treatment-he.html` | `treatment.html` |
| `contact-he.html` | `contact.html` |

`vercel.json` contains rewrites so clean URLs (e.g. `/about`) map to the right `.html` file.

## Known outstanding items

1. ~~Contact form non-functional.~~ **Resolved.** Both forms post to Formspree via `fetch()`. Verified 2026-08-29.
2. ~~Images, fonts, and JS load from Framer's CDN.~~ **Resolved 2026-09-04.** All 89 assets
   (44 fonts, 42 images, 3 photos) are committed under `assets/` and every page points at the
   local copies. Framer's analytics beacon, its editor bootstrap, 103 dead `modulepreload`
   hints and 24 dead search-index meta tags were removed at the same time. No page makes any
   request to Framer any more, verified live on all 12 pages. **The Framer subscription can
   now be cancelled without breaking the site.** Google Fonts and the Meta Pixel are unrelated
   and still in use.
3. ~~Domain not yet migrated.~~ **Resolved.** `yaelfried.com` serves from Vercel; pushes to `main` reach the live domain. Verified 2026-08-29.
4. **Search Console is connected**, contrary to an earlier note here. As of 2026-09-04 it shows
   4 clicks in ~3 months, and 6 of the 12 pages are not indexed: `/home-en`, `/trace-suggestion`,
   `/treatment`, `/process-he`, `/process` are "Crawled - currently not indexed", and
   `/contact-he` is "Discovered - currently not indexed". The sitemap is healthy, so this is a
   content/authority judgment by Google rather than a technical fault. This is the largest open
   item for search visibility.

## Editing conventions

- Keep edits to plain HTML/CSS — no build step, no framework.
- When editing text, edit both the Hebrew and English version of a page if the change applies to both.
- The site is RTL for Hebrew pages (`dir="rtl"` likely set somewhere in `<html>` — verify before structural changes) and LTR for English pages.
