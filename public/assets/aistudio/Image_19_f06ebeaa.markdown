---
name: Escrow Agent
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#45474a'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#76777b'
  outline-variant: '#c6c6ca'
  surface-tint: '#5e5e61'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1c1e'
  on-primary-container: '#848386'
  inverse-primary: '#c7c6c9'
  secondary: '#546500'
  on-secondary: '#ffffff'
  secondary-container: '#cdf22a'
  on-secondary-container: '#596c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#241a00'
  on-tertiary-container: '#a27f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e2e5'
  primary-fixed-dim: '#c7c6c9'
  on-primary-fixed: '#1b1c1e'
  on-primary-fixed-variant: '#464749'
  secondary-fixed: '#cdf22a'
  secondary-fixed-dim: '#b2d400'
  on-secondary-fixed: '#171e00'
  on-secondary-fixed-variant: '#3e4c00'
  tertiary-fixed: '#ffdf91'
  tertiary-fixed-dim: '#f3c000'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display:
    fontFamily: Anton
    fontSize: 112px
    fontWeight: '400'
    lineHeight: 96px
    letterSpacing: 0.02em
  display-mobile:
    fontFamily: Anton
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 38px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-code:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-mono-sm:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.12em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 2rem
  space-xl: 4rem
---

## Brand & Style

This design system establishes an editorial, high-contrast fintech aesthetic at the intersection of avant-garde creative direction and immutable transaction security. Rejecting default SaaS tropes—soft gradients, generic glassmorphism, and pastel rounded surfaces—it draws heavily from brutalist Swiss typography, archival legal documents, and digital ledger telemetry.

### Tone & Personality
- **Architectural & Authoritative:** Built on structural grids, strict 1px hairline framing, and absolute clarity.
- **Radically Unadorned:** Relies on massive typographic scale contrasts, stark negative space, and laser-precise metadata instead of decorative fluff.
- **Kinetic & Precise:** High-contrast interactions that mimic physical triggers, telegraphic ledger entries, and zero-latency status confirmations.

### Design Principles
1. **Typography as Architecture:** Monumental condensed headers command attention; dense monospaced ledgers convey unassailable technical precision.
2. **Structural Linearity:** Depth is communicated strictly via 1px geometric grid boundaries, razor-sharp dividers, and tonal planar shifts—never diffuse drop shadows.
3. **Signal over Decoration:** Color is deployed strictly as semantic status instrumentation (Neon Lime for cleared/active, Golden Yellow for custody/pending, Coral Orange for dispute/void).

## Colors

The palette operates on stark polarity: an editorial canvas of Soft Ivory punctured by deep Midnight Black slabs and hyper-saturated signal accents.

### Core Swatches
- **Soft Ivory (`#FAF8F3`):** The primary canvas background. Warm, tactile, and reminiscent of high-grade archival paper.
- **Midnight Black (`#08090B`):** The primary grounding color. Used for dominant typography, high-impact inverted panels, structured hairline borders, and primary interactive containers.
- **Neon Lime (`#CDF22B`):** The primary kinetic signal. Reserved for active escrow validation, funds release confirmation, focal interactive markers, and verified system states.
- **Golden Yellow (`#FFC900`):** State indicator for escrow hold, milestone in verification, and pending custody.
- **Coral Orange (`#FF6845`):** Alert and friction indicator for milestone rejection, canceled deals, or arbitrated disputes.
- **Warm Grey (`#8A8780`):** Secondary structural token used for hairline grid rules, monospaced metadata keys, timestamps, and de-emphasized transaction IDs.

### Semantic Border & Line Values
- Border on Light: `rgba(8, 9, 11, 0.12)` for internal divisions; `#08090B` for key structural frames.
- Border on Dark: `rgba(250, 248, 243, 0.15)` for internal divisions; `#FAF8F3` for focused borders.

## Typography

The typographic hierarchy enforces a disciplined three-tier structure:
- **Headlines (`Anton`):** Always transformed to uppercase. Set extremely tight with tracking slightly expanded for breathability at scale. Used for colossal numbers, manifestos, milestone totals, and sectional banners.
- **Narrative & Prose (`Inter`):** Clean, neutral neo-grotesque set with standard sentence casing for dispute logs, contract terms, descriptions, and user notes.
- **Telemetry & Technical Signals (`Space Mono`):** Strictly uppercase, tracking wide (`+0.08em` to `+0.12em`). Applied to financial values, hash stamps, PayPal authorization tokens, transaction statuses, and chronological table timestamps.

## Layout & Spacing

The structural layout relies on an editorial 12-column architectural grid defined by high-contrast lines and visible axis demarcations.

### Grid & Alignment Rules
- **Desktop (1024px+):** 12-column fluid grid, 48px outer margins, 24px internal gutters. Sections are framed by crisp 1px borders forming continuous tabular cells.
- **Tablet (768px - 1023px):** 6-column grid with 32px margins and 20px gutters.
- **Mobile (< 768px):** 2 or 4-column structure with 20px margins and 16px gutters. Elements span full width with bottom borders creating a continuous index-card stack.
- **Negative Space Ratio:** High void volumes (64px–128px between major narrative blocks) contrasted with hyper-dense data modules (8px–12px between metadata rows).

## Elevation & Depth

Zero diffuse drop shadows, blurs, or skeuomorphic bevels are permitted anywhere in the system.

### Planar Structure
- **Hairline Framing:** Elevation is conveyed by sharp 1px borders dividing structural planes. Overlapping items use distinct background fills (`#FAF8F3` against `#08090B`) to establish depth.
- **Inverted Panels:** Modals, persistent escrow timeline cards, and high-priority action decks utilize full `#08090B` fill with `#FAF8F3` text on top of the `#FAF8F3` ground.
- **Hard Layer Offset (Active State):** High-priority focus cards or active hovering states use a hard physical offset: a solid 2px or 3px border with an unblurred `#08090B` kick-shadow offset strictly at `x: 3px, y: 3px` with `0px` blur.

## Shapes

The primary geometry is strictly architectural, sharp-edged, and orthogonal (`roundedness: 0`).

### Shape Exceptions
- **Panels, Grids, Cards, Inputs:** Razor 90-degree right angles (`border-radius: 0px`).
- **Status Pills & Action Chips:** Full rounded capsule edges (`border-radius: 9999px`) to create intentional contrast against the otherwise rectilinear grid framework.
- **Signal Dots:** Pure circular points (`width: 6px; height: 6px; border-radius: 50%`) embedded within monospaced metadata and outlined pill tags.

## Components

### Buttons
- **Primary Action:** Solid `#08090B` background, `#FAF8F3` label in `Space Mono` 11px uppercase, 0px border radius, 1px border (`#08090B`). Height: 48px. Includes a trailing 6px circle in `#CDF22B`. Hover state flips to `#CDF22B` background with `#08090B` text.
- **Secondary / Outlined Pill:** `#FAF8F3` background, 1px border (`#08090B`), full pill radius (`9999px`), padding: `8px 20px`. Hover: Background shifts to `#08090B`, text shifts to `#FAF8F3`.

### Status Indicators & Chips
- Outlined capsules (`border-radius: 9999px`, 1px solid border). Height: 24px. Typography: `label-mono-sm`.
- **Released / Complete:** Border: `rgba(8, 9, 11, 0.2)` with a `#CDF22B` pulse dot.
- **Funds Pending / In Escrow:** Border: `rgba(8, 9, 11, 0.2)` with a `#FFC900` static dot.
- **Disputed / Void:** Border: `rgba(8, 9, 11, 0.2)` with a `#FF6845` static dot.

### Inputs & Financial Entry
- Minimal, underlined or bottom-bordered box (`border-bottom: 2px solid #08090B; border-top: 0; border-left: 0; border-right: 0`).
- Background: Transparent or `#FAF8F3`.
- Currency amounts display in `Anton` (e.g., `USD 12,500.00`), while form labels sit above in `Space Mono` 10px uppercase `#8A8780`.
- Focus state: Border bottom switches to `#CDF22B` with a `#08090B` active outline indicator.

### Transaction Cards & Ledger Lists
- **Structure:** Zero drop shadow. 1px hairline border in `#08090B` or `rgba(8,9,11,0.12)`.
- **Ledger Rows:** Fixed height (48px or 56px), separated by 1px bottom lines. Col 1: Status dot + Contract ID (`Space Mono`). Col 2: Milestone description (`Inter`). Col 3: Amount (`Anton`). Col 4: Action button (`Outlined Pill`).

### Milestone Timeline
- Step-based horizontal or vertical ledger track using a stark 1px vertical guide.
- Completed nodes show solid `#08090B` rings with `#CDF22B` core centers. Active custody node uses an amber `#FFC900` indicator. Future steps use empty 1px `#8A8780` rings.