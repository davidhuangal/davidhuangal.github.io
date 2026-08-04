<!-- Hallmark · studied: yes · DNA-source: url (https://jxmo.io/) · extracted 2026-08-03 -->

# Design - davidhuangal.github.io

Locked design system.
Future Hallmark runs read this file first; pages defer to it.
Amend intentionally - the file is the rule.

## System
- Genre · editorial
- Macrostructure · Long Document (leaning Letter)
- Theme · studied-DNA (source: https://jxmo.io/) · accent axis swapped warm-red → moss green at user request
- Axes · light paper / system grotesk (weight-led) / chromatic moss
- Type discipline · single family; hierarchy from weight, not size (headings 800 at 1.4-1.8em, barely above body)
- Structure quirks · bare text nav with no wordmark or button; plain `<hr>` section dividers; `[year]`-prefixed lists; no footer
- Links are the only accent surface; the page is link-dense, so the accent footprint is recurring, not flood

## Provenance
Extracted from https://jxmo.io/ on 2026-08-03 as a public reference for the user's brand (attestation: public reference).
Source mode: URL.
Tokens are exact where sourced (paper, rule, source accent #9B0000); the moss accent is a deliberate brand substitution at matched lightness/chroma discipline.
Fonts are exact: none loaded by the source - Tailwind default system stacks.
Rhythm is unknown - HTML alone can't judge density.

## Tokens (canonical · `tokens.css` is the source of truth)
```css
:root {
  --color-paper:      oklch(100% 0 0);          /* source: white */
  --color-paper-2:    oklch(95% 0 0);           /* source table stripe #eee */
  --color-ink:        oklch(22% 0 0);
  --color-ink-2:      oklch(50% 0 0);           /* source: opacity .5 on <time> */
  --color-rule:       oklch(85% 0 0);           /* source border #ccc */
  --color-accent:     oklch(42% 0.08 145);      /* moss · replaces source #9B0000 */
  --color-accent-ink: oklch(98% 0.005 145);
  --color-focus:      oklch(45% 0.10 145);

  --font-display: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body:    var(--font-display);          /* single family is the design */
  --font-mono:    ui-monospace, "SF Mono", Menlo, monospace;

  /* 4-pt spacing scale, named: --space-3xs … --space-4xl. See tokens.css.  */
  /* Type scale stays flat on purpose: h2 ≈ 1.4em, h1 ≈ 1.8em, weight 800. */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms;  --dur-base: 240ms;  --dur-slow: 320ms;

  --radius-card: 8px;  --radius-pill: 999px;  --radius-input: 6px;
}
```

## CTA voice
- No filled buttons anywhere - links ARE the CTA: `--color-accent` text, underline on hover.
- If a true button is ever unavoidable · accent fill · `--radius-input` · quiet padding.

## Motion stance
- Silent. No reveals, no scroll animation; hover underline and color shifts only.
- Reduced-motion fallback · ≤150 ms opacity crossfade.

## Exports
`tokens.css` (in this project) is the source of truth.
For Tailwind v4 `@theme`, DTCG `tokens.json`, or shadcn/ui CSS variables, ask "extend design.md with Tailwind exports".

## Variants (deliberate deviations from the source DNA)
- Minimal end-matter footer (`.foot-min`): hairline rule + © line with RSS/GitHub/LinkedIn + legal disclaimer.
  The source has no footer, but this content must live site-wide.
- Dark scheme: derived from the system (neutral near-black paper, moss lifted to oklch(75% 0.09 145)).
  The source is white-only; dark support was already shipped and is kept.
- Inline links keep persistent underlines (see Notes below); bare-text nav links are the exception.
- Film-thread details (the one permitted artsy layer): portrait is film photography with a small
  muted figcaption naming the stock; `.doc-list` bullet markers take the moss accent.
  Cap: no textures, reveals, decorative dividers, or further flourishes on top of this.

## Notes (do NOT carry over from source)
- Color-only link affordance: source links have no underline until hover; ship persistent underlines or verify contrast standalone.
- Dead JS payload: source loads jQuery/popper/progressbar unused - carry nothing.
- Source base text color is softened via an unaudited JS Tailwind config; this system pins ink explicitly instead.
