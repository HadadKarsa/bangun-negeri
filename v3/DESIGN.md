# DESIGN.md — bangun-negeri v3

Owner: wiwi. Written before `theme.css`, and the reason for every choice in it.

## Design Read

**Reading this as: an Indonesian open-data editorial page for the general public and
journalists, in a warm newsprint-ledger visual language, dial ENERGY 2 / RHYTHM 3 / MOTION 1.**

Why those dials:

- **ENERGY 2, not 1.** The page has to say hello before a stranger will read a table. One
  large serif headline, one full-width photograph, one loud number per screen. No gradients,
  no glow, no glass: the energy comes from scale and from the photograph, not from colour.
- **ENERGY 2, not 3.** This is a page people quote in an argument. A page that performs is a
  page nobody cites. Nothing moves on its own, nothing shouts in caps.
- **RHYTHM 3.** Nine sections that all looked like "centred title, subtitle, identical card
  grid" is exactly what made hadad say *jelek*. Each section here has the shape its content
  actually has: a photo-led hero, a ledger band, one big chart, a dense indicator grid,
  long-form prose with full-bleed figures, a six-card reading, a table, a timeline, a
  two-by-two of caveats, a source list. They do not share a template.
- **MOTION 1.** Hover, focus and press states only. No scroll animation, no count-up, no
  pulse. Two reasons: a data page is read, not watched, and the page must be fully legible
  with JavaScript disabled, which rules out anything that starts hidden and is revealed by
  script. `.reveal` is styled as a resting state, not an entrance.

## Identity motif

**Garis khatulistiwa: a hairline that runs the width of the content and is interrupted once,
at its centre, by a short vertical tick.**

The equator crosses Indonesia. It is the line that makes the page's geography literal: the
fires, the peat and the haze all sit on it, and the cities in the air-quality section are
strung along it from Sumatra to Kalimantan. The tick costs one pseudo-element and it is the
one gesture that would look wrong on a page about anywhere else.

It repeats at exactly five places, always the same size and weight:

1. under the site header,
2. under every `.sec-head`,
3. above the KPI band,
4. as the top rule of every table,
5. above the footer.

Second half of the motif, the ledger habit: **a number never appears without its year at the
end of the same line.** Every figure on this page is set in a fixed-width numeric column with
its year and source on the rule beneath it, the way a BPS statistical table sets them. That is
the page's promise made visual: no number is naked.

## Palette

Two cores and one accent. Everything else is a functional status colour, used only where it
means something.

### Light

| Token | Hex | Reason |
|---|---|---|
| `--paper` | `#FAF8F3` | Warm off-white, the colour of Indonesian newsprint and of a photocopied BPS table. Pure white reads as a dashboard. |
| `--paper-2` | `#F2EEE4` | One step down, for bands that separate sections without a border. |
| `--paper-3` | `#E8E2D4` | Table header and hover fill, the shaded row of a printed table. |
| `--card` | `#FFFFFF` | Panels lift off the paper by being lighter than it, not by shadow. |
| `--ink` | `#1A1917` | Near-black with a warm bias so it sits on the paper instead of cutting it. 16.6:1. |
| `--ink-2` | `#4A463E` | Secondary prose and table cells. 8.9:1. |
| `--ink-3` | `#5F5A50` | Captions, years, source lines, units. 6.5:1 on paper, 5.3:1 on `--paper-3`. |
| `--line` | `#DFDACD` | Hairline rules only. Never carries text. |
| `--line-2` | `#8C8676` | Rule that must be seen as an edge (table top, chart axis). 3.4:1, meets non-text contrast. |
| `--accent` | `#A31C22` | Merah bata, the red of the flag deepened until it passes AA on paper (7.2:1) and on `--paper-2` (6.6:1). Used for links, the active nav marker, the focus ring, the one bar fill that matters. |
| `--accent-soft` | `#F6E3E1` | The accent at 8% for the active nav pill and the alert panel's ground. |

### Dark

| Token | Hex | Reason |
|---|---|---|
| `--paper` | `#141310` | Warm near-black, same hue family as the light paper, so the page feels like the same object at night. |
| `--paper-2` | `#1E1C17` | Band fill. |
| `--paper-3` | `#272420` | Table header and hover. |
| `--card` | `#1A1815` | Panels are lighter than the page, same rule as light mode inverted by role, not by maths. |
| `--ink` | `#F6F2E9` | Warm off-white. 16.6:1. |
| `--ink-2` | `#D3CDC0` | 11.7:1. |
| `--ink-3` | `#A8A292` | 7.3:1 on paper, 6.1:1 on `--paper-3`. |
| `--line` | `#322E26` | Hairline. |
| `--line-2` | `#6E6A5E` | Visible edge, 3.4:1. |
| `--accent` | `#F2877F` | The same merah bata lifted to a light value so it passes on a dark ground (7.6:1). Not the light-mode red inverted: a different value chosen for the dark ground. |
| `--accent-soft` | `#3B2222` | |

### Functional status colours

Used only for air-quality levels and fetch state. Never decorative.

| Meaning | Light text | Light ground | Dark text | Dark ground |
|---|---|---|---|---|
| Baik / live | `#1E5C3B` | `#E4F0E7` | `#7FC79A` | `#1B2A20` |
| Sedang / cache | `#7A5400` | `#F8EED6` | `#E0B45E` | `#2A2416` |
| Tidak sehat / gagal | `#9C3A00` | `#FAE7DC` | `#F0A06A` | `#2C2018` |
| Berbahaya | `#6B1F4A` | `#F4E4EE` | `#D79AC8` | `#2A1E28` |

Each pairing is measured in the comment block at the top of `theme.css`. Every one clears
4.5:1 as text and 3:1 as a fill behind white or dark text.

## Type

**System stack only.** No webfont, no CDN: the box may be offline, and a font request that
blocks first paint is the one performance failure a data page cannot afford.

Two voices, because the page has two jobs:

- **Serif speaks.** `ui-serif, "Iowan Old Style", Georgia, "Times New Roman", serif` for the
  h1, section headlines, the lede, pull quotes and photo captions. A serif headline is what
  makes this read as a piece of writing rather than a control panel, and it is the one
  typographic signal that separates it from every dashboard in the genre.
- **Sans measures.** `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif` for body prose, labels, tables, buttons and every
  number. Sans at 16–17px is what Indonesian readers read on a phone all day; it also holds
  up at the small sizes the source lines need.

Scale, fluid, one ratio per step (1.2 at the small end, 1.33 at the top):

| Token | Range | Use |
|---|---|---|
| `--t-xs` | 12 → 13px | source lines, table footnotes, units |
| `--t-sm` | 13.5 → 15px | captions, chips, nav, labels |
| `--t-base` | 16 → 17.5px | body prose |
| `--t-lg` | 18 → 21px | lede, `.sub` |
| `--t-h3` | 20 → 24px | panel headings |
| `--t-h2` | 26 → 38px | section headlines |
| `--t-h1` | 34 → 62px | the one headline |
| `--t-num` | 26 → 44px | KPI and stat numbers |

Numbers are `font-variant-numeric: tabular-nums` everywhere, so a column of figures lines up
and a changing value does not shift its neighbours.

## Layout

- Content width `--wrap: 1080px`, prose measure capped at `68ch` so a line never runs the
  full width of a laptop.
- Mobile-first. Base styles are the 320px state; breakpoints at **720px** and **1024px**,
  chosen where the content stops working, not at device widths.
- Spacing scale on 4px: `4 8 12 16 24 32 48 64 96`, with a mobile register (`--s7` and up
  halve below 720px).
- Radii: `2px` on inputs and chips, `4px` on panels, `0` on photographs and tables. Nothing
  is a pill. The page is printed matter, not an app.
- Shadow: none. Panels are separated by a hairline and a change of ground, and the header
  by its bottom rule. A page that needs no elevation has no elevation to get wrong.
- The header is sticky only from 720px up. On a phone a sticky bar costs 60px of every
  screen for the whole length of the page, which is a tax on reading.

## Decisions, one line each

| Decision | Reason |
|---|---|
| Serif headline, sans body | The page argues and it counts; two jobs, two voices. |
| Warm paper instead of white | White is the dashboard default; newsprint is what a statistics page should feel like. |
| One accent, merah bata | The flag's red is the only colour this page has a right to; deepening it to 7.2:1 makes it usable as link and focus colour too. |
| No shadow anywhere | Elevation that is everywhere communicates nothing; a hairline and a ground change do the same work at no cost, and a shadow-free page prints and screenshots cleanly. |
| Hairline + centre tick as motif | The equator is the line the page's geography sits on; it costs one pseudo-element and belongs to nowhere else. |
| Year always beside the number | The page's whole claim is that no figure is naked; the layout has to keep that promise, not just the copy. |
| MOTION 1, `.reveal` static | Anything that starts hidden is invisible with JS off, and this page must be readable with JS off. |
| Table scrolls inside its own box | A five-column table cannot reflow into 320px without lying about the data; a contained scroll keeps the page itself from scrolling sideways. |
| Bar in the province table is the only chart furniture | It answers "how much bigger is Kalimantan Barat" in one glance; a second chart would be decoration. |
| Air-quality cards carry the level in words, not only colour | Colour alone is not a status; the words are the status, the tint is the reinforcement. |
| No icons | Every icon this page could use (flame, leaf, lungs) would be a generic glyph doing a word's job. The words are already there. |

## What was cut

- **Count-up animation on the KPI numbers.** It hides the number for 900ms and communicates
  nothing. The number is the point.
- **Pulsing "live" dot.** It pulses whether or not the fetch succeeded. The status chip says
  `live`, `cache` or `gagal` in words, which is the information the dot was pretending to be.
- **The `.ver` version badge in the brand.** A version number is for the person maintaining
  the page, not the person reading it.
- **The eyebrow above the h1.** It said "data terbuka, diperbarui otomatis", which the h1 and
  the status chip already say.
- **The second and third photographs in the hero.** One photograph, full width, is a
  statement; three is a gallery.
