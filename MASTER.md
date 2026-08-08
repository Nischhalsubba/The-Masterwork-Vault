# The Masterwork Vault - HIG Air Design System

## Visual thesis
Bright, neutral, Apple HIG-aligned utility interface with restrained semantic color, system sans-serif typography, generous and comfortable spacing, and softly rounded flat/elevated surfaces. Neverwinter item artwork supplies the visual richness; the interface supplies hierarchy, familiarity, accessibility, and calm.

## Interaction thesis
Fast, controlled transitions using 160ms micro-interactions and 240ms state changes with `cubic-bezier(.2, 0, 0, 1)`; hover uses background/border shifts with at most a 1px lift, press scales to .985, view changes retain the existing short fade/translate entrance, and the interface has no bounce, parallax, decorative 3D, looping ambient effects, or motion that delays crafting information.

## Principles
- Purpose: crafting information is the visual priority.
- Agency: browsing, filtering, selection, and back paths remain visible and predictable.
- Responsibility: accessible contrast, reduced motion, explicit states, and no hidden critical interactions.
- Familiarity: conventional search, list, split-view, sidebar, and segmented-control behavior.
- Flexibility: the same information model adapts from wide desktop to phone without squeezing long names into unreadable columns.
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
- Tertiary/small web label: `#6E6E73`
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
- Detail title: 26-30px, 700, tight tracking; long names wrap naturally
- Heading: 17-24px, 650
- Body: 15-17px, 400, line-height 1.5-1.6
- Secondary: 12-14px, 400-550
- Label: 11-12px, 650, restrained uppercase only for taxonomy
- Sidebar navigation: 14px, 550-650, 1.35 line height

Long item names and metadata wrap when needed. Text is never compressed to preserve card geometry.

## Spacing tokens
- Base scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Minimum interactive target: 44px
- Standard panel padding: 20-24px
- Workspace padding: 24-32px desktop, 16-20px tablet, 12-16px phone
- List row padding: 14-16px
- Split-view gap: 20-24px
- Header horizontal padding: 20-48px responsive

## Layout tokens
- Maximum application content width: 1760px
- Desktop class sidebar: 224px
- Desktop catalog split: list minimum 520px, detail minimum 560px
- Detail panel always receives enough width for a two-column stat grid and readable recipe rows
- At <=1380px the class sidebar becomes a horizontal scrolling class strip to free workspace width
- At <=1180px the catalog becomes a single-column flow with the selected detail shown before the item list
- At <=900px the top navigation and filters reflow instead of compressing
- At <=680px item lists become single-column, detail actions become full-width, and header/navigation stack cleanly
- At <=520px stat grids and dense secondary layouts collapse to one column

## Radii
- Small: 10px
- Medium: 14px
- Large: 18px
- Extra large: 24px
- Pills: 999px

## Elevation
- Level 0: flat surface with separator
- Level 1: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.035)`
- Level 2: `0 12px 32px rgba(0,0,0,.08)`

## Base components
### Button
- 44px minimum height
- Rounded medium radius
- Primary actions use the interactive semantic color
- Secondary/toolbar actions use fill and separator states
- States: default, hover, focus-visible, active, disabled

### Search field
- 48px preferred height on catalog/toolbars
- Filled secondary background with visible focus ring
- Full width before filters begin to wrap

### Catalog item row
- List-first composition with 14-16px internal padding
- Item artwork remains untouched and visually distinct
- Selection is communicated by semantic selected background + border, not color alone
- Metadata gets its own line-height and breathing room

### Detail inspector
- Minimum 560px on wide desktop
- Header uses icon, flexible text column, and action without forcing the title into a narrow sliver
- Stats use two columns by default
- Segmented controls may wrap; labels must never clip
- At narrow widths, the primary action moves to its own full-width row

### Sidebar / class rail
- 224px desktop width
- 14px labels with comfortable vertical padding
- No text truncation for class names
- Converts to horizontal scrolling navigation before it can make the content split cramped

## Motion tokens
- Fast: 160ms
- Standard: 240ms
- View entrance: existing 360ms GSAP fade/translate
- Easing: `cubic-bezier(.2, 0, 0, 1)`
- No decorative ambient animation
- `prefers-reduced-motion` disables nonessential transitions/animation

## Responsive acceptance targets
The interface must remain usable and visually balanced at 375, 768, 1024, 1280, 1440, and 1728 CSS pixels. At each width:
- no horizontal page overflow
- no clipped sidebar, filter, title, or recipe text
- primary controls remain >=44px
- selected item detail remains discoverable
- long item names wrap instead of shrinking
- search/filter controls reflow before becoming cramped

## Asset and data safety
The redesign must not change catalog data, recipes, item/material image URLs, exact PNG overrides, sprite indices, direct-image-first behavior, or atlas fallback behavior. UI layout may adapt around these assets; the asset pipeline itself is locked.
