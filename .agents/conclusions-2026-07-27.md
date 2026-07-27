# Conclusions after running all skills

Skills run: marketing-context, seo-audit, a11y-audit, site-architecture, schema-markup, aeo, ai-seo, copywriting.
Copy read: all 12 main site pages, breaktheloop and its 3 legal pages, links, start.
Everything below was measured with a tool or read in a browser. Where a number is unreliable, it says so.

---

## The one finding that three separate skills reached independently

**There are no headings on any page of yaelfried.com.** Not one h1, not one h2, across all 12 pages.

| Skill | How it showed up |
|---|---|
| seo-audit | Google has no structural signal for what any page is about |
| a11y-audit | 8 heading violations. Screen reader users have nothing to navigate by |
| aeo | Structure scored **20/100 on every single page**, the lowest of all five dimensions |

Framer exported the visual headlines as plain boxes. One fix closes all three findings. This is the highest-leverage change available and nothing else comes close.

---

## Measured results

### Accessibility (a11y_scanner, WCAG 2.2 AA)

| Site | Issues | Critical | Serious |
|---|---|---|---|
| yaelfried.com | 1309 | 72 | 236 |
| start | 175 | 25 | 27 |
| breaktheloop | 56 | 0 | 25 |
| links | 8 | 0 | 5 |

**The 72 critical on the main site are mostly your contact form.** Every input on contact-he and contact has no label. That is the page where people convert, and it is the least usable page on the site for anyone using assistive tech.

breaktheloop is the healthiest of the four. Zero critical.

### AI citation readiness (aeo_audit, healthcare thresholds)

| Page | Composite | Structure |
|---|---|---|
| yaelfried.com/ | 79/100 | 20/100 |
| /trace-suggestion-he | 78/100 | 20/100 |
| /treatment-he | 77/100 | 20/100 |
| /about-he | 77/100 | 20/100 |
| breaktheloop | **44/100** | 20/100 |

**Caveat, stated honestly:** this tool matches English credential patterns. Yael's credentials are written in Hebrew ("דוקטור לביולוגיה", "מכון ויצמן"), so the Experience and Expertise scores on Hebrew pages are unreliable and probably understated. The **Structure score is language-independent** because it counts heading elements, and that one is real.

breaktheloop's 44 is genuinely low for the page that matters most in the funnel.

### Structured data (schema_validator)

| Page | Blocks | Score |
|---|---|---|
| yaelfried.com/ | Person + FAQPage | 75/100 |
| other main pages | Person only | 50/100 |
| breaktheloop | Person only | 50/100 |
| links | **none** | 0/100 |

Missing everywhere: Organization, and `sameAs` linking the social profiles. Missing on pages that already have the content for it: FAQPage on the trance page, which is written as questions and answers already.

### Architecture

**breaktheloop and yaelfried.com contain zero links to each other.** Verified by searching both files. Only the links page points at both.

That is the actual root of the competition problem. Google has no signal that these are one practitioner. Two disconnected sites chasing the same Hebrew terms.

### AI crawler access

robots.txt on both yaelfried.com and breaktheloop is `User-agent: * / Allow: /`. GPTBot, PerplexityBot, ClaudeBot and Google-Extended are all permitted. **No blocking problem.** Good news, and worth stating because it is the one thing that would have made everything else pointless.

### Content

The treatment page carries eleven distinct conditions on a single page: repeating patterns, stuckness, relationships, self-image, anxiety and phobias, insomnia, low mood, trauma and PTSD, chronic pain, smoking. Site-architecture calls this the hub-and-spoke case: one page cannot rank for eleven topics.

---

## Priority order

1. **Add real headings to the main site.** Closes the top seo-audit, a11y-audit and aeo finding at once.
2. **Label the contact form inputs.** 72 critical accessibility failures, on the conversion page.
3. **Cross-link breaktheloop and yaelfried.com.** Smallest change here, and it is what stops them competing.
4. **Add Organization schema with sameAs everywhere, FAQPage on the trance page, and any schema at all on links.**
5. **Split the treatment page into per-condition pages,** each framed as a loop.
6. **Retire start.**

---

## Still blocked

Search Console holds what people actually type to reach these sites. Without it, the keyword targeting written into the 12 new titles is reasoning, not measurement. It is the one input that would change decisions rather than confirm them.
