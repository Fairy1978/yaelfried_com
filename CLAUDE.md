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
2. **Images, fonts, and JS still load from Framer's CDN** (`framerusercontent.com`). This works fine today, but if the Framer subscription is ever cancelled, these assets may stop loading. Before cancelling Framer, download all CDN assets referenced in these pages and rehost them locally (update `<img src>`, `<link href>`, `<script src>` accordingly).
3. ~~Domain not yet migrated.~~ **Resolved.** `yaelfried.com` serves from Vercel; pushes to `main` reach the live domain. Verified 2026-08-29.
4. **No Search Console.** Nothing measures what people actually search to reach the site, so all keyword targeting is reasoning rather than measurement.

## Editing conventions

- Keep edits to plain HTML/CSS — no build step, no framework.
- When editing text, edit both the Hebrew and English version of a page if the change applies to both.
- The site is RTL for Hebrew pages (`dir="rtl"` likely set somewhere in `<html>` — verify before structural changes) and LTR for English pages.
