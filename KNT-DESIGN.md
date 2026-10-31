# KNT Everyday — design system

Updated: 31 October 2026. Replaces the former JARVIS / crimson HUD design.

## Direction

A quiet, practical classroom workspace: off-white canvas, navy headings, teal actions, warm accent colours for categories. Preserve KNT branding and clear Thai labels. Prioritise the teacher's current task and mobile readability.

## Shared files

- `assets/portal.css`: portal layout, hero, shortcuts, search, filters, pins and tool cards.
- `assets/knt-ui.css`: scoped application tokens and compatibility styles, enabled by `body.knt-modern`. Page-specific rules use `data-knt-page`.
- `app/modern.css`: native Classroom routes and mobile navigation.
- `ส่งงาน/gradebook.css`: gradebook, workspace entry and score tables.
- `assets/knt-mark.svg`: vector navigation mark.
- `assets/utilities.css`: committed prebuilt Tailwind utilities for exam, learning, results and Plickers. Rebuild using the command in `scripts/tailwind.config.cjs`; no runtime CSS compiler is needed in the browser.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#f5f7fa` |
| Surface | `#ffffff` |
| Heading / text | `#1b3043` |
| Secondary text | `#657787` |
| Primary action | `#087f78` |
| Strong navy surface | `#153f45` |
| Soft accent | `#e6f4ef` |
| Border | `#dfe7ec` |
| Thai text | Anuphan, then system fonts |

Existing semantic success/error/attendance colours remain distinct. Mathematics retains its own notation fonts. Do not recolour meaningful status feedback as decoration.

## Interaction and performance

- Prefer static backgrounds; no decorative canvas loops, boot delays or permanently animated ornaments.
- Avoid fixed gradient backgrounds and backdrop blur on scrolling/mobile surfaces.
- Use one Thai font family, limited weights and non-blocking font loading.
- Make mobile form text at least 16px to avoid input-focus zoom on iOS.
- Keep wide tables inside their own scrolling region; the document must not overflow horizontally.
- Preserve native links, controls, keyboard focus and reduced-motion preferences.
- Keep published assets versioned by content; add required app assets to their own service-worker allowlist. Do not cache API responses or delete another application's cache.
- Export-only ExcelJS loads on demand, with bounded waiting and recoverable failure.

## Data boundaries

Visual changes must preserve API endpoints, student and work IDs, storage keys, score calculations and write-confirmation behaviour. Keep score drafts before network requests. QR print layouts and embedded game canvases have independent layouts and are not globally rescaled by the app skin.
