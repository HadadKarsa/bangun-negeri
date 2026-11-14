# DATA-AUDIT — bangun-negeri v2

Audit of every figure the page shows. Owner: wowo. Companion to `data.js`.
Checked against the research corpus in `../.research/` and against the live APIs on
**2026-11-13**.

Rule applied throughout: **no figure without a year and a source**. Where the spec
and the source disagree, the source wins and the disagreement is written down here
rather than silently resolved.

---

## 1. Live series (World Bank, `api.worldbank.org`)

All 17 indicators were fetched and returned a value on 2026-11-13. The page takes the
newest non-null year per indicator, so the year column below is what the API actually
returned, not what the spec assumed.

| id | indicator | value | year | note |
|---|---|---|---|---|
| `gdp` | NY.GDP.MKTP.CD | 1.445.642.584.163,81 | 2025 | |
| `gdp_pc` | NY.GDP.PCAP.CD | 5.059,63 | 2025 | |
| `gdp_growth` | NY.GDP.MKTP.KD.ZG | 5,108 | 2025 | |
| `inflation` | FP.CPI.TOTL.ZG | 1,913 | 2025 | |
| `population` | SP.POP.TOTL | 285.721.236 | 2025 | |
| `unemployment` | SL.UEM.TOTL.ZS | 3,237 | 2025 | |
| `poverty` | SI.POV.NAHC | 8,5 | 2025 | national poverty line |
| `manufacturing` | NV.IND.MANF.ZS | 19,065 | 2025 | |
| `exports` | NE.EXP.GNFS.ZS | 22,847 | 2025 | |
| `fdi` | BX.KLT.DINV.CD.WD | 22.698.158.405,27 | 2025 | |
| `life_exp` | SP.DYN.LE00.IN | 71,288 | 2024 | |
| `urban` | SP.URB.TOTL.IN.ZS | 59,393 | 2025 | |
| `electricity` | EG.ELC.ACCS.ZS | 99,9 | 2024 | |
| `internet` | IT.NET.USER.ZS | 72,781 | 2024 | |
| `forest` | AG.LND.FRST.ZS | 50,670 | 2024 | % of land area |
| `renewable` | EG.FEC.RNEW.ZS | 20,2 | 2021 | oldest series on the page |
| `co2` | EN.GHG.CO2.MT.CE.AR5 | 812,2042 | 2024 | Mt CO₂e, AR5 |

**Fallback values in `data.js` are these same numbers**, so a reader who lands while the
API is unreachable sees the last real value with `fallback: true`, not a rounded guess.
Earlier drafts of the file carried stale fallbacks (life expectancy 68,6; forest 48,4;
CO₂ 700) — corrected here against the live response.

## 2. Live series (other APIs)

| id | source | endpoint | TTL |
|---|---|---|---|
| `fx_usdidr`, `fx_idrusd` | ExchangeRate-API | `open.er-api.com/v6/latest/USD` | 15 min |
| `aq_*` (6 cities) | Open-Meteo | `air-quality-api.open-meteo.com/v1/air-quality` | 15 min |

Air-quality cities and coordinates:

| id | city | lat | lon |
|---|---|---|---|
| `aq_palangka` | Palangka Raya | -2.21 | 113.92 |
| `aq_pekanbaru` | Pekanbaru | 0.51 | 101.45 |
| `aq_pontianak` | Pontianak | -0.02 | 109.34 |
| `aq_jambi` | Jambi | -1.61 | 103.61 |
| `aq_banjarmasin` | Banjarmasin | -3.32 | 114.59 |
| `aq_jakarta` | Jakarta | -6.21 | 106.85 |

The AQI banding is the US EPA scale (`aqLevel`): ≤50 Baik, ≤100 Sedang, ≤150 Tidak sehat
(sensitif), ≤200 Tidak sehat, ≤300 Sangat tidak sehat, >300 Berbahaya.

**Contract note:** `app.js` asks for `aq_palangka`, not `aq_palangka_raya`. The id in
`data.js` matches `app.js`. This was a real break — the Palangka Raya card would have
stayed empty forever.

## 3. Static figures

| id | value | year | source | check |
|---|---|---|---|---|
| `mangrove` | 3,40 juta ha | 2025 | FAO, via Wikipedia *Mangrove* | `mang.txt:6` — "Indonesia has the world's largest extent of mangroves, at 3.40 million ha". Global 15,9 Mha; Asia 6,10 Mha. ✔ |
| `peatland` | 16,5–27 juta ha | — | Wetlands International / KLHK, via Wikipedia *Peat swamp forest* | `peat.txt:26` — "ranged between 16.5 and 27 million hectares". **Shown as a range, not a point value.** ✔ |
| `protected_area` | 27 juta ha (554 kawasan) | 2023 | KLHK, via Wikipedia *Indonesia* | `idn.md:75` — "554 protected areas covering 27 million hectares, equivalent to 14% of its land area". ✔ |
| `national_parks` | 57 kawasan | 2023 | KLHK, via Wikipedia *List of national parks of Indonesia* | `parks.txt:1` — "Of Indonesia's 57 national parks…". ✔ |
| `coral_species` | 574 spesies | 2020 | Coral Triangle / Conservation International | `ct.md:1` — Bird's Head Seascape "hosts 574 species (95% of the Coral Triangle, and 72% of the world's total)". ✔ |
| `forest_1900` | 170 juta ha (84% daratan) | 1900 | FAO, via Wikipedia *Deforestation in Indonesia* | `defor.md:2` — "estimated forest cover of 170 million hectares around 1900". ✔ |
| `forest_2000` | <100 juta ha | 2000 | FAO, via Wikipedia *Deforestation in Indonesia* | `defor.md:2` — "decreased to less than 100 million hectares by the end of the 20th century". ✔ |

## 4. Disagreements with SPEC.md — resolved

1. **`protected_area`: SPEC says 36,1 Mha.** No source in the corpus supports 36,1 Mha.
   The only figure found is 27 Mha / 554 areas / 14% of land area. **The page uses 27 Mha.**
   If 36,1 Mha is meant to be "kawasan hutan" (forest estate by legal status) rather than
   "kawasan lindung" (protected areas), those are different measures and must not be
   shown under the same label. Needs a KLHK citation before it can go back in.

2. **`peatland`: SPEC gives no number.** The corpus gives a range only (16,5–27 Mha).
   **The page shows the range**, labelled as an estimate, rather than inventing a midpoint.

3. **`national_parks` 57** — confirmed by `parks.txt`, kept.

4. **`forest_2000` "<100 juta ha"** — kept as an inequality, because that is what the
   source says. It is not converted to a point value.

## 5. Not in `data.js` — deliberate

The karhutla (fire/haze) figures and the province burn table named in SPEC §"Static" are
**not** in the data layer. They are narrative content that lives in the markup
(`index.html`, `parts/karhutla.*`), and no record id for them is consumed by `app.js`.
Putting them in `BN` would mean maintaining the same numbers in two places. If the v2
table needs to be sortable from `BN`, they should be added as records with their own
source and year — and audited here first.

## 6. Behaviour under failure

Verified by running `data.js` in a sandbox with `fetch` forced to reject:

- 7 static records exist **synchronously**, before any network call.
- All 25 network-backed ids still exist after `BN.ready`; none is `undefined`.
- A failed fetch keeps the record's shape (`city`, `level`, `levelLabel` for AQ), so the
  card renders with "—" instead of reading `undefined`.
- `BN.ready` never rejects. `BN.status()` reports `{live, stale, failed, lastFetch}`.
- `BN.toCSV()` emits 32 rows (header + 31 records) with no `undefined` cells.

## 7. What still needs a human

- **`protected_area` 36,1 Mha vs 27 Mha** — pick the definition, then cite it.
- **`peatland`** — if a single official KLHK number exists, replace the range.
- Every static figure is sourced to a **secondary** page (Wikipedia citing FAO/KLHK).
  Before this page is presented as authoritative, each one should be traced to the
  primary publication. The numbers are consistent with the corpus; they are not yet
  verified against a primary document.
