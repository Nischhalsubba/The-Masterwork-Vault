# Masterwork Vault design system

The Masterwork Vault is a dense crafting workspace. The interface should feel like a precise game tool rather than a marketing page: compact, calm, evidence-aware, and fast to scan.

## 1. Principles

1. **Use the canvas.** Wide screens should expose more useful crafting information, not add decorative whitespace.
2. **Dense, not cramped.** Reduce empty space before reducing type size. Keep readable text and clear group boundaries.
3. **One hierarchy.** Navigation, filters, lists, details, graphs, and drawers use the same spacing, typography, radius, and border language.
4. **Evidence is visible.** Unknown or unverified values stay explicit. Do not create a cleaner UI by hiding uncertainty.
5. **Progressive detail.** The list answers “what is it and can I craft it?”; the detail pane answers “what do I need?”; drawers expose proof and deep metadata.
6. **Ergonomic interaction.** Touch targets are at least 44px on narrow screens, focus states remain obvious, and controls never overlap.
7. **No decorative motion dependency.** Reduced-motion users keep the same information and task flow.

## 2. Foundations

The source of truth is `src/design/tokens.css`.

### Color

Use semantic tokens, not route-specific hex values.

- `--mw-ds-bg`: application canvas
- `--mw-ds-surface`: primary cards and panels
- `--mw-ds-surface-subtle`: quiet controls and nested surfaces
- `--mw-ds-border`: default dividers
- `--mw-ds-border-strong`: emphasized dividers and hover states
- `--mw-ds-text`: primary information
- `--mw-ds-text-secondary`: supporting information
- `--mw-ds-text-muted`: metadata
- `--mw-ds-accent`: primary interaction
- `--mw-ds-accent-soft`: selected/active state

Blue is functional. It marks navigation, selection, and actionable state. It is not decoration.

### Spacing

Use the 4px rhythm:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64`

Default component gaps should normally be 8–16px. Page gutters are responsive tokens. Avoid adding arbitrary values when an existing token fits.

### Typography

- Body and control text must remain comfortably readable.
- Catalog item names: 14px minimum.
- Supporting metadata: 12px minimum on primary work surfaces.
- Page headings: fluid 21–28px range for workspaces.
- Labels/eyebrows can be smaller only when they are supplementary and never the sole carrier of critical information.

Do not solve density by shrinking essential text.

### Shape

- Small control radius: 8px
- Standard card/panel radius: 12px
- Large feature surface: 16px only when needed
- Pills use a fully rounded radius only for status/filter chips.

## 3. Layout system

### Desktop ≥ 1181px

- Persistent workspace rail: 208px.
- Main workspace is fluid; do not reintroduce a global 1500px content cap.
- Catalog uses:
  - collection switcher,
  - horizontal class filter,
  - two-pane item list + detail workspace.
- The list width uses `--mw-ds-list-width`; the detail pane owns the remaining width.
- On sufficiently wide detail panes, ingredients may become two columns.
- Graph nodes may use the full dependency canvas width; do not cap them at an arbitrary fixed width.

### Tablet 681–1180px

- Keep two-pane workspaces while there is enough room.
- Side panels reduce width before essential text or touch targets shrink.
- Horizontal filter bars can scroll rather than wrap into tall empty columns.

### Phone ≤ 680px

- Primary task surfaces become single-column.
- Keep a 44px minimum touch target.
- Class selection is horizontally scrollable.
- The Compare action remains available.
- Secondary desktop-only links may be hidden when a mobile-native route already exposes the same capability.
- Horizontal page overflow is a regression.

## 4. Components

### Workspace rail

Purpose: global navigation only.

- One active state.
- Compact 38–44px rows.
- Tools are grouped separately from core workspace routes.
- Search/density utilities belong in navigation chrome, not above recipe content.

### Class filter

Purpose: replace the old tall class rail.

- Horizontal, icon-backed, scrollable.
- Uses NW-Hub class emblems from `https://nw-hub.com/classes`.
- Direct image URLs live in `src/data/classIcons.ts`.
- If an external image fails, show the class initials; filtering must remain usable.
- “All craftables” uses an internal text/icon fallback, not an invented class emblem.

### Catalog list row

The row must answer, at scan speed:

- item type/slot,
- item name,
- class compatibility,
- crafting profession level when attributable,
- source/campaign,
- plan action or recipe-missing state.

Rows are separated by dividers, not floating-card shadows.

### Catalog detail pane

The selected item’s stable working context.

Priority:
1. item identity,
2. crafting requirement and profession,
3. recipe/cost mode,
4. ingredients/acquisition,
5. evidence and secondary metadata.

On wide screens the detail pane should use its width rather than leaving an empty right half.

### Crafting level

“Level” is ambiguous in Neverwinter. The UI must distinguish:

- **Profession crafting requirement** — shown as “Profession level 20”.
- **Item/use level** — may appear in item stats when captured.

Do not relabel an item-use requirement as a crafting requirement.

For current captured Sharandar and Menzoberranzan Masterwork collections, profession level 20 is backed by the progression evidence model. Unsupported future tiers remain “not captured.”

### Recipe graph

- Sidebar = search and item selection.
- Canvas = dependency structure.
- Graph cards use available width.
- Crafted and raw nodes remain visually distinct.
- Raw nodes expose acquisition actions.
- Selected recipe summary includes campaign, profession, and profession level requirement.

### Drawers and dialogs

- Use for evidence, comparison, and metadata that should not displace the primary task.
- Drawers must trap focus where appropriate and restore focus on close.
- Modal layers must never cover or intercept unrelated navigation/tab controls.

## 5. External artwork policy

Class emblems are sourced from NW-Hub at the user’s request.

Source page:
- https://nw-hub.com/classes

Current direct URL pattern:
- `https://nw-hub.com/assets/classes/emblems/<class>.webp`

The app does not treat these images as Neverwinter data evidence. They are navigation artwork only. A network failure must degrade to initials without blocking class filtering.

Game item/material artwork keeps the existing provenance system and must not be mixed with class-navigation artwork.

## 6. Accessibility

- Keyboard-visible focus for every interactive element.
- No pointer-event interception between stacked surfaces.
- 44px touch targets on narrow screens.
- Minimum readable typography for primary work surfaces.
- No information encoded by color alone.
- Reduced-motion mode removes ambient/entrance motion without removing content.
- Dialogs/drawers use correct roles, focus management, Escape behavior, and return focus.
- Every responsive release checks 320, 390, 768, 1024, 1440, and wide desktop layouts.

## 7. Information density

The application may offer density preferences, but all modes preserve the same facts.

- **Comfortable:** more breathing room.
- **Default:** optimized for regular use.
- **Summary:** fewer secondary details, not smaller critical text.

Density is controlled with spacing and disclosure—not by making labels unreadable.

## 8. Governance

For new UI work:

1. Reuse semantic tokens from `src/design/tokens.css`.
2. Reuse an existing component/pattern before adding a new one.
3. Do not add a route-specific CSS file for a small visual exception if the design-system layer can express it.
4. Add a regression test for layout or interaction bugs before fixing them.
5. Test wide-screen utilization and 320px overflow.
6. Preserve explicit unknown/evidence states.
7. Update this document when a new reusable pattern is introduced.

The long-term cleanup direction is to retire legacy route CSS gradually. Until then, `src/design-system.css` is intentionally imported last and is the authoritative normalization layer.
