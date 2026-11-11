<!-- Hallmark · studied: yes · DNA-source: url (https://haeinjung.com/) · amended 2026-11-11 -->

# Design - davidhuangal.github.io

Locked design system.
Future Hallmark runs read this file first; pages defer to it.
Amend intentionally - the file is the rule.

## System
- Genre · editorial
- Macrostructure · fixed sidebar plus one narrow text column
- Theme · studied-DNA (source: https://haeinjung.com/) · layout only, with our own ink color and typeface
- Axes · one ink on paper / one sans at one size / chromatic moss
- Type discipline · single family at body size everywhere; hierarchy from uppercase, letterspacing and spacing, never from size or weight
- Structure quirks · no rules or dividers between sections; lists carry no markers; `[year]` prefixes live in markup
- Color · the moss accent is the ink for all text, links and icons. There is no separate neutral text color.

## Provenance
Layout studied from https://haeinjung.com/ in 2026-11 as a public reference.
The source typeface was dropped on purpose so the site does not read as a copy.
Instrument Sans was picked from a side-by-side trial of sans serifs.
The moss ink carries over from the previous system (studied from https://jxmo.io/, 2026-08-03).

## Tokens (canonical · `tokens.css` and the `:root` block in `global.css` are the source of truth)
```css
:root {
  --color-paper:  oklch(100% 0 0);
  --color-accent: oklch(42% 0.08 145);   /* moss · the only ink */

  --ink:   var(--color-accent);
  --paper: var(--color-paper);
  --rule:  color-mix(in oklch, var(--ink) 30%, transparent);

  --font-body:    'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-body);      /* single family is the design */
  --font-mono:    'IBM Plex Mono', ui-monospace, monospace;   /* code only */

  --size:       0.8125rem;   /* 13px · everything */
  --size-small: 0.75rem;     /* 12px · legal, meta lines */
  --size-prose: 0.875rem;    /* 14px · notes, since they are long reads */

  --side: 232px;   /* sidebar width */
  --col:  560px;   /* text column */
}
```
Weights are 400 and 600 only.
600 is for `strong`, table headers and the h3/h4 inside notes.
Fonts are self-hosted through `@fontsource`.
Nothing loads from a third party, which keeps the "no tracking" line in the footer true.

## Layout
- Sidebar · fixed left, `--side` wide, uppercase with 0.04em tracking. Name row on top with the theme toggle, nav below, contact links pinned to the bottom.
- Nav · plain links with no underline. The current page is underlined.
- Page · `main` sits right of the sidebar with one `--col` column. Notes prose runs to 640px.
- Footer · the © line and the legal disclaimer close every page at `--size-small`.
- Home · two columns (560px text, 420px photo). The photo stretches to the height of the heading, bio and legal text together, and stacks under the text below 1180px.
- Photos · masonry wall, one column on phones, two from 900px, three from 1280px, with a lightbox.
- Narrow (720px and under) · the sidebar becomes a static block at the top with the nav in a wrapping row.

## CTA voice
- No filled buttons anywhere.
- Links are the CTA. They take the ink color with a persistent 1px underline.
- Section-level links (`.link-cta`) are uppercase like the nav.
- The only buttons are bare icons in the sidebar (theme toggle, photo shuffle on home).

## Motion stance
- Silent. No reveals, no scroll animation, no transitions on hover.
- The home photo swaps on shuffle after the next image has preloaded.
- Reduced-motion fallback · durations capped at 150ms.

## Dark scheme
- Paper goes to neutral near-black `oklch(16% 0 0)` and the moss ink lifts to `oklch(75% 0.09 145)`.
- It follows the OS setting unless the toggle forces light or dark through `data-theme` on `<html>`.
- Code blocks use shiki dual themes and follow the same two signals.
- Figure plates in notes stay light in both schemes, since paper figures are drawn on white.

## Notes
- Keep the photo column free of text overlays and flip effects.
- Paper Notes is a plain nav link with no dropdown.
- Do not add a second color, a display size or a heavier heading weight. The flatness is the design.
