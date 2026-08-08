# The Masterwork Vault - HIG Air Design System

## Visual thesis
Bright, neutral, Apple HIG-aligned utility interface with restrained semantic color, system sans-serif typography, generous but efficient spacing, and softly rounded flat/elevated surfaces. Neverwinter item artwork supplies the visual richness; the interface supplies hierarchy, familiarity, accessibility, and calm.

## Interaction thesis
Fast, controlled transitions using 160ms micro-interactions and 240ms state changes with `cubic-bezier(.2, 0, 0, 1)`; hover uses background/border shifts with at most a 1px lift, press scales to .985, view changes retain the existing short fade/translate entrance, and the interface has no bounce, parallax, decorative 3D, looping ambient effects, or motion that delays crafting information.

## Principles
- Purpose: crafting information is the visual priority.
- Agency: browsing, filtering, selection, and back paths remain visible and predictable.
- Responsibility: accessible contrast, reduced motion, explicit states, and no hidden critical interactions.
- Familiarity: conventional search, list, split-view, sidebar, and segmented-control behavior.
- Flexibility: the same information model adapts from desktop to phone.
- Simplicity: fewer decorative cards, fewer colors, stronger spacing and hierarchy.
- Craft: consistent typography, alignment, control states, separators, and hit areas.
- Delight: polish comes from responsiveness and detail, not spectacle.

## Color tokens
Semantic roles only. The interface must still look coherent if interactive blue is absent from a screenshot.

- Canvas / grouped background: `#F5F5F7`
- Elevated background: `#FBFBFD`
- Surface: `#FFFFFF`
- Secondary surface: `#F2F2F7`
- Primary label: `#1D1D1F`
- Secondary label: `#6E6E73`
- Tertiary/small web label: `#6E6E73` (kept at WCAG AA contrast for small text)
- Separator: `rgba(60,60,67,.18)`
- Strong separator: `rgba(60,60,67,.28)`
- Fill: `rgba(118,118,128,.12)`
- Hover fill: `rgba(118,118,128,.18)`
- Interactive blue: `#0071E3`, reserved for links, focus, explicit actions, and selected emphasis
- Selected background: `#EAF4FF`
- Success: `#248A3D`
- Warning: `#A86600`
- Danger: `#C9342F`

Checked web contrast on white: primary label 16.83:1, secondary/small label 5.07:1, interactive blue 4.70:1.

## Typography
Font stack:
`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif`

Display stack:
`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`

Roles:
- Display: 38-58px responsive, 700, line-height 1.02, tracking about -0.045em
- Detail title: 24-26px, 700, tight tracking
- Heading: 16-24px, 650
- Body: 15-17px, 400, line-height about 1.5
- Secondary: 12-13px, 400-550
- Label: 11-12px, 650, restrained uppercase only for taxonomy

Long item names wrap when needed. Body text is never compressed to preserve card geometry.

## Spacing tokens
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px
- Minimum interactive target: 44px
- Phone gutters: 10-16px depending surface
- Desktop workspace gutters: 24px

## Radius tokens
- Small: 10px
- Medium: 14px
- Large: 18px
- XL: 24px
- Pills: 999px

## Elevation
- Level 1: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.035)`
- Level 2: `0 12px 32px rgba(0,0,0,.08)`

Shadows are sparse. Most hierarchy comes from surfaces, spacing, and separators.

## Layout
Desktop:
- 64px translucent app toolbar
- 218px class navigation sidebar
- flexible catalog list column
- 330-390px detail inspector
- catalog receives the largest share of width
- detail inspector is sticky while there is sufficient horizontal space

Tablet:
- sidebar collapses into a sticky horizontal class selector
- catalog becomes primary content
- detail moves below the catalog
- toolbar/filter groups remain horizontally scrollable instead of wrapping into clutter

Phone:
- one column
- 10-16px gutters
- full-width search
- selected item detail follows the catalog in document order
- minimum 44px interactive areas

## Components
- Toolbar: translucent only where it floats above scrolling content
- Search: filled neutral field with explicit focus ring
- Sidebar: flat list with low-contrast selected fill
- Catalog: list first, not a card grid
- Detail: inspector panel with clear sectioning
- Chips: neutral supporting metadata, never primary actions
- Primary button: dark neutral fill; blue is not required for the primary CTA
- Segmented controls: neutral fill + elevated selected segment
- Recipe rows: separated list rows instead of nested mini-cards
- Item/material icons: existing sources and fallback logic pass through untouched

Every interactive control supports default, hover, focus, active, and disabled styling.

## Motion tokens
- Fast: `160ms`
- Standard: `240ms`
- Easing: `cubic-bezier(.2,0,0,1)`
- Hover: tiny elevation or background change
- Press: scale to `.985`
- No bounce, parallax, decorative 3D, or looping ambient effects
- Respect `prefers-reduced-motion`

The existing GSAP view-entry animation may remain because it is short and functional; decorative Three.js ambient rendering is disabled.

## Accessibility
- Normal small text uses at least 4.5:1 contrast on the primary light surfaces.
- Keyboard focus is visible on buttons and links.
- Search uses `:focus-within` plus the input's accessible label from the React markup.
- Controls remain at least 44px where practical on web/touch layouts.
- Reduced motion globally collapses animation/transition duration.
- Layout is defined for 375px, 768px, 1024px, and 1440px classes of viewport.

## Asset lock
Do not change or reroute:
- item images
- material icons
- image/data URLs
- recovered PNG overrides
- sprite mappings
- verified icon indexes
- fallback logic

Only presentation and layout may change unless separately approved.
