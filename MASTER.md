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

## Crafting workbench
The Plan view is a workbench with six focused subviews instead of separate top-level navigation destinations:
- Overview: selected craftables, inventory-aware shortages, shared-batch optimization and savings.
- Craft tree: expandable per-item dependency trees with exact units, craft count, yield and leftovers. Every material node has an explicit Inspect action that opens the Materials inspector focused on that material. This tree explains each selected item independently; cross-plan optimization remains an Overview concern.
- Craftable now: evaluates final craftables and craftable intermediate materials against the locally stored inventory. Owned intermediate materials are consumed before their recipes are expanded.
- Checklist: shopping/farming list containing only the optimized raw-material shortage after inventory is applied.
- Professions: shows an inventory-aware dependency-ordered crafting sequence first, then groups those same numbered steps by recorded profession. A step that consumes another active craftable must appear later than that dependency. Missing profession data must be labeled `Unspecified profession`, never inferred.
- Saved: local saved plans and shareable links. Share links contain item IDs and quantities only; inventory is not encoded or shared.

### Quantity semantics - locked
These labels and operations are data semantics, not presentation choices:
- `required` / `Need` means units of that material demanded by the parent recipe or current plan.
- `outputQuantity` / `yield` means units produced by exactly one craft.
- `crafts required = ceil(units still needed / yield per craft)`.
- Every input amount is a per-craft amount and is multiplied by `crafts required` exactly once.
- `produced = crafts required * yield per craft`.
- `leftover = produced - units still needed`.
- Shared-plan optimization aggregates demand for an intermediate material before applying the ceiling operation, allowing one produced batch to satisfy demand from multiple selected items.
- Inventory is consumed before new crafts are scheduled. Inventory of a crafted intermediate suppresses the raw-material demand that would otherwise be needed to make those owned units.
- Raw inventory is consumed only after all required intermediate recipes have been expanded.
- All quantities are non-negative whole units. Fractional craft/material quantities are invalid.

### Recipe evidence and reverse lookup
- Every craftable material may expose its exact one-craft inputs, explicit output quantity, source status and evidence record.
- Every final gear, weapon, accessory and profession-tool detail exposes its recorded direct ingredient quantities, source state, source record and available evidence lines.
- Screenshot-backed verification is shown only when the underlying source state supports that claim; supplemental records remain visibly supplemental.
- Soul Bead keeps the later screenshot resolution in evidence rather than hiding the older conflicting record.
- Material reverse lookup is built from the canonical `usedBy` graph and separates final craftables from crafted-material consumers.
- Material reverse lookup also shows the material's total optimized demand across the current Plan before inventory is applied. For craftable materials it shows required units, craft count, produced units and leftovers; for raw materials it shows the optimized raw-unit requirement.

### Persistence
- Inventory storage key: `masterwork-vault.inventory.v1`.
- Saved-plan storage key: `masterwork-vault.saved-plans.v1`.
- Both are browser-local only; no account or remote persistence is implied.
- Shared plan query payloads are validated against current catalog item IDs and positive integer quantities before being loaded.

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
- no clipped sidebar, filter, title, recipe, tree-node, or workbench-tab text
- primary controls remain >=44px
- selected item detail remains discoverable
- long item names wrap instead of shrinking
- search/filter controls reflow before becoming cramped

## Asset and data safety
The redesign and workbench must not change catalog data, recipes, item/material image URLs, exact PNG overrides, sprite indices, direct-image-first behavior, or atlas fallback behavior. UI layout and calculations may consume these records; the source asset/data pipeline itself is locked.