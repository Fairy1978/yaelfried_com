# yaelfried.com

Static website for Yael Fried, a trauma/anxiety therapist (trance & suggestion methods). Bilingual: Hebrew (default) and English.

## Background

This site was originally built and hosted on Framer (paid plan, ~29 NIS/month, paid yearly through December 2026). It was migrated to static HTML to move hosting to Netlify for free, since Framer doesn't support exporting sites for self-hosting.

## Deploy workflow

- This repo is connected to Netlify for auto-deploy: every push to `main` on GitHub (`github.com/Fairy1978/yaelfried_com`) triggers a new Netlify deploy.
- To make a change: edit the relevant `.html` file(s), `git add`, `git commit`, `git push`. No manual upload needed.

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

`netlify.toml` contains redirects so clean URLs (e.g. `/about`) map to the right `.html` file.

## Known outstanding items

1. **Contact form is currently non-functional.** It was a Framer-native form; needs to be replaced with Netlify Forms (add `netlify` attribute to the `<form>` tag and a hidden `form-name` input) on `contact.html` and `contact-he.html`.
2. **Images, fonts, and JS still load from Framer's CDN** (`framerusercontent.com`). This works fine today, but if the Framer subscription is ever cancelled, these assets may stop loading. Before cancelling Framer, download all CDN assets referenced in these pages and rehost them locally (update `<img src>`, `<link href>`, `<script src>` accordingly).
3. **Domain not yet migrated.** `yaelfried.com` still points to Framer's hosting. Once the Netlify deploy is verified working, DNS needs to be updated to point to Netlify instead.

## Editing conventions

- Keep edits to plain HTML/CSS — no build step, no framework.
- When editing text, edit both the Hebrew and English version of a page if the change applies to both.
- The site is RTL for Hebrew pages (`dir="rtl"` likely set somewhere in `<html>` — verify before structural changes) and LTR for English pages.
