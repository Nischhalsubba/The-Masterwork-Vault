# Masterwork Vault Next-Level Release Candidate

This overlay is intentionally additive around the current production repository. It does not overwrite recipe/source truth and preserves the three user-approved unknowns as `null`.

## Product and UI

- First-class `/readiness` center with seven-profession progression, Workshop rank, unlock matrix, next action, remaining direct unlock cost, density preference, and portable state.
- Portable Vault JSON now includes every versioned `masterwork-vault.*` browser-state entry, covering progression, inventory, saved plans, preferences, and future versioned state without importing recipe/source truth.
- `/data-health` reverification console with integrity blockers, `quantityExplicit: false` yield queue, quality-variant review, legacy set normalization queue, icon/evidence association review, missing/rejected artwork, acquisition coverage, and patch-sensitive verification ledger.
- Universal `Cmd/Ctrl+K` search across items, materials, recipes, professions, progression, and tools.
- Advanced `/explore` multi-filter catalog and `/graph` recursive dependency view.
- Shared accessible `OverlayDialog`, enhanced comparison, global/route error boundaries, loading skeletons, compact/comfortable density, feedback states, and responsive UI.

## Planning and player state

The current production repository already contains inventory-aware recursive crafting, leftovers, ordered dependency stages, shareable plans, plan checklists, saved plans, and profession-grouped requirements. This overlay preserves those systems and makes progression/import/export consume the same versioned browser-state namespace instead of maintaining a separate parallel state system.

## Architecture

- `playerState.ts`: versioned per-profession state, safe normalization, legacy Journey preservation, and progression migration.
- `portableState.ts`: bounded all-Vault state import/export with namespace validation and player-state normalization.
- `readiness.ts`: pure unlock/readiness calculations.
- `professionMath.ts`: pure Focus, Speed, Morale, and event math.
- `verification.ts`: duplicate/reference/quantity/yield/cycle checks plus artwork, evidence, variant, set, and acquisition reverification queues.
- `navigation.ts` + replacement `RouteSync.tsx`: one explicit history/navigation API. `RouteSync` no longer interrogates or clicks DOM nodes.
- `MobileV4Shell.tsx`: consumes explicit route/application/detail events; contains no `querySelector`, `MutationObserver`, or synthetic `.click()` state synchronization.
- `apply-next-level-integration.mjs`: idempotently integrates existing App handlers and nested recipe state during a clean `prebuild`.
- Optional verification/artwork/acquisition metadata expands the catalog schema without fabricating missing values.
- Lazy secondary routes and route-level error boundaries keep failures isolated.

## Design, motion, and 3D

- Design DNA codified across measurable tokens, qualitative visual language, and effects.
- Motion personality is calm/decisive product UI: fast feedback, short eased entrances, no ornamental bouncing, and `prefers-reduced-motion` support.
- GSAP readiness choreography uses scoped context/matchMedia cleanup and transform/opacity only.
- Three.js `AmbientVault` is a restrained hero-background instrument: capped DPR, low draw calls, delta-time motion, offscreen pause, low-end/save-data/reduced-motion fallback, ResizeObserver, and full GPU/listener cleanup.
- Touch targets, focus states, status text/icons, high-density layouts, and safe responsive behavior follow the UI/UX and motion audits.

## Release verification

- Existing screenshot-locked recipe verifier remains part of the release chain.
- `verify-knowledge.mjs` guards current-system invariants and guarantees all three approved unknowns remain `null`.
- Domain tests cover known Focus, Speed, Morale refill, and 2x Professions behavior.
- Playwright covers readiness persistence, command search, Data Health, direct-route reloads, 320/375/430/768/1024/1280/1440/1920 widths, phone landscape, keyboard/focus behavior, reduced motion, clean data-health blockers, and critical-route smoke captures.
- GitHub Actions runs release verification, TypeScript/Vite build, Chromium E2E, and retains visual smoke captures as artifacts.
- Netlify configuration pins Node 22, production build/publish paths, SPA fallback, security headers, immutable hashed assets, and a non-cached service worker.

## Deliberately not fabricated

These remain unknown/excluded exactly as approved:

1. exact current profession XP thresholds Level 1→20;
2. modern Chultan Masterwork I/II Choice Pack binding;
3. exact current Stronghold purchase gate.

The acquisition schema similarly never invents vendor/drop/location data. Missing acquisition evidence remains a queue.
