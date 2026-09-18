# Masterwork Vault workspace design system

This document defines the product-level UI rules for the app-wide redesign introduced in PR #35.

## Product model

The Vault is a working crafting reference, not a marketing site. Every primary route has one job:

| Route | Job |
| --- | --- |
| Catalog | Find and inspect a craftable quickly. |
| Plan & Craft | Turn selected craftables into quantities, dependencies, shortages, sequence and acquisition work. |
| Materials | Understand one material: recipe, source, inventory and reverse dependencies. |
| Progression | Learn the Masterwork path and keep a local reading/progression checklist. |
| Reference | Keep workshop mechanics, artisan context and source policy out of task-focused recipe screens. |
| Explorer | Perform deep multi-filter catalog research. |
| Readiness | Record player/workshop state and identify next preparation work. |
| Recipe graph | Inspect one recipe in isolation without changing the current plan. |
| Data health | Audit evidence quality, unresolved values and reverification queues. |

## Navigation rules

- One global shell is authoritative across every route.
- Desktop/tablet use the left workspace rail.
- Phone uses a compact top bar plus five primary bottom destinations.
- Local page navigation never replaces global navigation.
- A feature should not create a second app shell or full-screen navigation system.
- Supporting tools live under the **Tools** group instead of competing with primary workspaces.

## Layout rules

- The first viewport is for work, not a promotional hero.
- Page introductions are compact and explain the page's job.
- Dense database views may use split panes.
- Detail panes remain visible while browsing lists where viewport size permits.
- Dependency graphs may scroll horizontally; they must not collapse into misleading linear lists solely to fit a phone.
- Cards are used only to group a coherent task or evidence unit, not as a default container for every piece of content.

## Visual foundations

Implemented as semantic CSS variables in `workspace-shell.css`.

- Background: quiet cool gray for the application canvas.
- Surface: white for active work surfaces.
- Accent: blue only for active navigation, primary actions and focus.
- Borders carry most separation; shadows are intentionally minimal.
- Radius hierarchy: 8px controls, 12px work surfaces, 14px phone grouped surfaces.
- Typography favors compact information density over oversized display text.

## Component rules

### Navigation
Purpose: orientation and movement between workspaces.

Do:
- show the current route,
- group supporting tools separately,
- keep route names stable across breakpoints.

Do not:
- add page-specific top bars that duplicate global navigation,
- float redundant journey or navigation launchers over content.

### Page header
Purpose: answer “what can I do here?”

Contains:
- short category/kicker,
- one H1,
- one-sentence purpose,
- optional route-specific secondary action.

Do not use a large marketing hero.

### Catalog
Purpose: fast discovery + inspection.

Structure:
1. compact page purpose,
2. collection context,
3. class/type/search refinements,
4. result list,
5. persistent detail/recipe inspector.

On phone, collection context appears before refinement controls so the user knows which Masterwork era is being searched before narrowing results.

### Plan & Craft
Purpose: execute a plan.

The Crafting Tree is a local planner view. It must share the global shell and planner tabs. It never creates its own sidebar or hides the rest of the app.

### Materials
Purpose: material intelligence.

The list is navigation; the detail pane is the primary content. Recipe/source/inventory/reverse-use information belongs together.

### Progression
Purpose: explain the path.

The progression chapter list is local navigation. Evidence and planning calculators remain subordinate to the current progression context.

### Reference and Data Health
Purpose: trust.

Reference explains mechanics and source policy. Data Health exposes uncertainty and maintenance work. Neither should look like a second product.

## Accessibility

- WCAG AA contrast is the baseline.
- All phone interactive targets are at least 44px.
- Focus remains visible.
- Route changes preserve meaningful focus.
- Information is never conveyed by color alone.
- Reduced motion is respected.
- Global navigation remains available on every route and breakpoint.

## Governance

A new UI pattern is accepted only if:
1. an existing component/pattern cannot express the job,
2. its purpose is documented,
3. desktop, tablet and phone behavior are defined,
4. it does not introduce a competing navigation or token system,
5. browser tests cover the user-visible behavior.
