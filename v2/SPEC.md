# bangun-negeri v2 — build spec

One static page, no build step, no framework, no bundler. Plain HTML + CSS + vanilla JS ES5-safe,
served by `python3 -m http.server` behind Tailscale at `/bangun-negeri/`.

Everything must work when opened from the tailnet URL with a trailing-slash-less path prefix
(`/bangun-negeri`), so **every asset reference is relative** (`theme.css`, `data.js`, `assets/x.jpg`)
— never `/theme.css`.

## Files (fixed contract — do not rename)

| file | owner | what |
|---|---|---|
| `v2/index.html` | brenour | markup only, no inline `<style>`, no inline `<script>` logic |
| `v2/theme.css` | wiwi | the whole design system, light + dark |
| `v2/data.js` | wowo | data layer, exposes `window.BN` |
| `v2/app.js` | brenour | render + interaction, consumes `BN` |
| `v2/assets/*` | fufu | photos + `CREDITS.md` |
| `v2/DATA-AUDIT.md` | wowo | source check of every static figure |

## data.js — public API (`window.BN`)

```js
BN.ready: Promise        // resolves when the first paint data is available (never rejects)
BN.records: Object       // id -> record, filled progressively
BN.on(id, fn)            // subscribe to one record id; fn(record) called immediately if present
BN.onAny(fn)             // called on every record update
BN.refresh()             // force refetch all; returns Promise
BN.toCSV()               // string: all records as CSV (id,label,value,unit,year,source,fetchedAt)
BN.status()              // {live: n, stale: n, failed: n, lastFetch: ms}
```

Record shape (every value in the page comes through this, no exceptions):

```js
{
  id: "fx_usdidr",
  label: "Kurs USD → IDR",
  value: 18089.5,          // number, or null when unavailable
  display: "Rp 18.090",    // preformatted id-ID string, or "—"
  unit: "IDR", year: 2026, // year is the data year, not the fetch year
  source: "ExchangeRate-API", url: "https://open.er-api.com/v6/latest/USD",
  fetchedAt: 1763... ,     // ms epoch of the successful fetch
  stale: false,            // true when served from cache past its TTL or from a fallback
  fallback: false          // true when this is a hardcoded last-resort value
}
```

Requirements:
- `fetch` with `AbortController` timeout (10 s), **retry twice with backoff** (400 ms, 1200 ms).
- `localStorage` cache key `bn:v2:<id>`, TTL 15 min for live (FX, air), 24 h for annual (World Bank).
  Serve cache immediately (stale-while-revalidate), then update.
- Never throw to the caller. A failed fetch leaves `value: null` and `stale: true`, or the fallback
  with `fallback: true`. The page must render with zero network.
- No third-party libraries. No `innerHTML` with untrusted strings.

### Record ids the page will ask for

Annual (World Bank, `https://api.worldbank.org/v2/country/IDN/indicator/<code>?format=json&per_page=10`,
take the newest non-null year):
`gdp` NY.GDP.MKTP.CD · `gdp_pc` NY.GDP.PCAP.CD · `gdp_growth` NY.GDP.MKTP.KD.ZG · `inflation` FP.CPI.TOTL.ZG ·
`population` SP.POP.TOTL · `unemployment` SL.UEM.TOTL.ZS · `poverty` SI.POV.NAHC · `manufacturing` NV.IND.MANF.ZS ·
`exports` NE.EXP.GNFS.ZS · `fdi` BX.KLT.DINV.CD.WD · `life_exp` SP.DYN.LE00.IN · `urban` SP.URB.TOTL.IN.ZS ·
`electricity` EG.ELC.ACCS.ZS · `internet` IT.NET.USER.ZS · `forest` AG.LND.FRST.ZS ·
`renewable` EG.FEC.RNEW.ZS · `co2` EN.GHG.CO2.MT.CE.AR5 (if it 404s, drop it silently)

Live:
`fx_usdidr` open.er-api.com/v6/latest/USD → rates.IDR, plus `fx_idrusd` = 1/rate.
`aq_<city>` open-meteo air-quality for Palangka Raya, Pekanbaru, Pontianak, Jambi, Banjarmasin, Jakarta
(`current=pm2_5,pm10,us_aqi`), with a `level` helper: ≤12 baik, ≤35 sedang, ≤55 tidak sehat (sensitif),
≤150 tidak sehat, >150 berbahaya.

Static (no fetch, hardcoded with source + year, must be audited):
`mangrove` 3.40 Mha · `peatland` · `protected_area` 36.1 Mha · `national_parks` 57 ·
`coral_species` 574 · `forest_1900` 170 Mha · `forest_2000` <100 Mha ·
plus the karhutla figures (107,465 ha Jan–Jun; 202,000 ha per Menhut 18 Aug; 38,310.86 ha Kalbar; etc.)
and the province burn table.

## theme.css — what wiwi must deliver

- Tokens in `:root`, **dark mode via `prefers-color-scheme` plus a `[data-theme="dark"]` override** and a
  toggle button the page will wire.
- Fluid type scale, 8-pt spacing, 3 radii, 2 shadows. System font stack only (no webfonts — the box is
  offline-ish and a font request would block first paint).
- Components the markup will use — **these class names are the contract, wiwi may add but not remove**:
  `header.site`, `.brand`, `.ver`, `nav.tabs a.active`, `.wrap`, `section.sec`, `h2.sec`, `p.sub`,
  `.panel` (+`.alert .warn .ok`), `.stat-row`, `.stat`, `.stat-num`, `.stat-unit`, `.stat-label`,
  `.live-badge`, `.pulse`, `.grid2`, `.grid3`, `.aq-grid`, `.aq-card`, `.aq-city`, `.aq-region`,
  `.aq-val`, `.aq-label`, `.lv-good .lv-mid .lv-bad .lv-verybad`, `.table-wrap`, `table`, `.num`,
  `.bar-cell`, `.bar-track`, `.bar-fill`, `ul.tl`, `.caveat`, `.src-note`, `footer.site`,
  `.sr-only`, `.skeleton`, `.chart`, `.toolbar`, `.btn`, `.chip`, `.card-media`, `.hero`, `.kpi-band`,
  `.spark`, `.legend`, `.swatch`, `.err`, `.ok`, `.warn`.
- Motion: entrance reveal on scroll (`IntersectionObserver` adds `.in`), number count-up hook class
  `.count`, bar fill transition, skeleton shimmer, hover lift on cards. All of it inside
  `@media (prefers-reduced-motion: no-preference)`.
- AA contrast in **both** themes for body text, muted text and every badge. Print stylesheet.
- No `!important` except in print/reduced-motion. No CSS nesting (older browsers). No `color-mix`
  without a plain fallback declared first.

## index.html — structure I will assemble

1. `<header class="site">` — brand + version `v2.0` + tab nav + theme toggle + refresh button.
2. `#intro` hero: h1, sub, `.kpi-band` of 4 headline numbers, hero image with credit.
3. `#live` — FX, GDP, inflation cards with live badges, last-updated ages, a sparkline of FX history
   kept in localStorage.
4. `#struktur` — 6–8 indicator cards + a bar chart comparing Indonesia to peers (hardcoded peer set).
5. `#alam` — Alam Indonesia: photos, mangrove/peat/coral figures, forest-loss timeline.
6. `#udara` — air quality cards, 6 cities, colour-coded, with the "Jakarta ≠ karhutla" caveat.
7. `#karhutla` — province table (sortable), burn-area timeline, impact panels.
8. `#batas` — data limits, kept and expanded.
9. `#tabel` — full sortable table of every record + "Unduh CSV" button.
10. `#sumber` — sources & methodology, per-source cards, fetch status.
11. `footer.site`.

## Non-negotiables

- Works with JS disabled enough to read: every number that is static is in the HTML, not injected.
- Every figure shows its year and source inline. No figure without provenance.
- No invented numbers. If a figure cannot be sourced, it is dropped and the drop is noted in `#batas`.
- Page weight under 400 KB total including images; images lazy-loaded, `width`/`height` set.
- Lighthouse-ish targets: no layout shift on data arrival (reserve space), tap targets ≥44 px,
  `lang="id"`, one `h1`, landmark elements, focus visible.
