# v3 revamp brief — wiwi

Read this whole file first. It is the contract for the v3 rebuild of `/bangun-negeri`.

## What the page is

A single-page Indonesian open-data site: Indonesia's economy, nature, air quality, and the 2026
forest fires (karhutla). Real data from World Bank, ExchangeRate-API and Open-Meteo, fetched live
in the browser. Audience: Indonesian general public and journalists, **not developers**. Today it
reads like a competent dashboard. hadad's verdict: "hmm jelek" (ugly). It must become something a
person would want to read and share.

## Read first, in this order

1. `/srv/nouride/.nouride/agents/skills/antislop/SKILL.md` — the core filter. Follow it, including
   the Delivery Gate at the end. Mode is DURING.
2. `.../antislop-copywriting/SKILL.md`
3. `.../antislop-ui/SKILL.md`
4. `.../antislop-human/SKILL.md`
5. `.../antislop-layoutmobile/SKILL.md`
6. Current page: `shared/bangun-negeri/public/index.html` and `theme.css`

## Files you write (exactly three, nothing else)

### A) `v3/DESIGN.md`
- The Design Read line: page kind / audience / visual language / dials ENERGY-RHYTHM-MOTION.
- Palette with hex values, light and dark, one-line reason per colour.
- Type scale and why that typeface. **System stack only** — no webfonts: the box may be offline and
  a font request would block first paint.
- The identity motif: one specific repeated gesture that makes this page belong to Indonesia and to
  nothing else. Name it, say where it repeats.
- One-line reason for every major decision (R-31).

### B) `v3/theme.css`
- Complete design system, replacing the current one. Target 30-45 KB.
- Light and dark, both designed, not inverted. Tokens in `:root`; dark via
  `@media (prefers-color-scheme: dark)` **and** `[data-theme="dark"]` / `[data-theme="light"]`.
- AA contrast in both themes, measured, ratios in a comment block at the top.
- Mobile-first, breakpoints 720 and 1024. No horizontal overflow at 320px. Tap targets 44px.
- All motion inside `@media (prefers-reduced-motion: no-preference)`.
- No CSS nesting. No `color-mix` without a plain fallback declared first.

### C) `v3/CONTENT.md`
- Every piece of Indonesian copy, rewritten: headline, subheads, all body prose, captions, caveats,
  button and link labels, footer.
- **ZERO em dashes** (R-02 hard gate). The current page has 61. Use commas, periods, colons,
  parentheses. Avoid en dashes in prose too.
- No AI marketing buzzwords, no generic CTAs. Write like a good Indonesian data journalist: plain,
  specific, concrete, short sentences. Indonesian, not translated English.
- Every number keeps its year and source inline. Never invent a figure. If a figure cannot be stood
  behind, mark `[CUT]` and give the reason in one line.
- Organise by section id in page order: `intro, live, struktur, alam, udara, karhutla, batas, tabel,
  sumber`.

## Class contract

Your CSS must style these; the markup and JS stay on them. You may add classes, never remove or
rename one (app.js sets several at runtime).

```
header.site .wrap .brand .ver nav.tabs a.active .tools .chip .btn .btn-icon
.theme-toggle .theme-label
main .wrap section.sec .sec-head h2.sec .sub .eyebrow .reveal .in
.kpi-band .kpi .kpi-label .kpi-num .kpi-meta .hero-media .credit
.panel .panel.alert .panel.warn .stat-row .stat .stat-num .stat-unit .stat-label
.live-badge .pulse .grid2 .grid3 .aq-grid .aq-card .aq-city .aq-region .aq-val
.aq-unit .aq-label .lv-good .lv-mid .lv-bad .lv-verybad .legend .swatch
.table-wrap table .num .bar-cell .bar-track .bar-fill .toolbar .th-sort ul.tl
.caveat .src-note footer.site .sr-only .skeleton .chart-wrap .chart-head .chart
.card-media .alam-tag .is-stale .is-fallback .is-busy .skip .ok .warn .err
```

## Hard constraints

- Touch nothing outside `v3/`. Do not touch `public/`, do not restart a server, do not run
  `tailscale`.
- No external requests: no webfonts, no CDN, no icon library. Inline SVG only with a written
  purpose (R-04).
- Every static number must be readable with JavaScript disabled. Do not design anything that needs
  JS to be legible.

## Deliverable

The three files, then:
1. Your Design Read and the three dials.
2. A Delivery Gate report: one PASS/FAIL line per item, each PASS backed by concrete evidence.
3. File sizes and the measured contrast ratios.

If any gate item fails, fix it before reporting. Do not write `index.html` or any JS; I assemble
those.
