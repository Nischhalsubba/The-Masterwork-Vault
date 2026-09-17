# Acquisition release review - 17 September 2026

## Scope

Harden PR #28's material acquisition workflow before the user-authorized merge and production release. Existing catalog data, exact recipe quantities, inventory storage and evidence classifications are unchanged. This is a focused feature review, not certification of the entire application or the current game's drops.

## Reproduced findings

The test-first commit `6b4b96f` reproduced three defects on both desktop and phone: natural-space spelling aliases did not match the slug aliases; named hunt modifiers were not searchable; and all 44 detailed guides mounted when the index was collapsed. All existing tests passed in that run (90 passed, 4 skipped, 6 new failures).

## Improvements

- Extracted typed search indexing and matching into a pure domain module with direct assertions for aliases, accents, word ordering, named modifiers and empty results. Search normalization does not alter catalog identity.
- Added composable acquisition-method and evidence filters, an explicit reset action, readable result counts and a helpful empty state.
- Render detailed guide content only when its native disclosure is open. Compute searchable text independently of the rendered details.
- Keep full literature caveats once in the source directory, while maintaining material-specific warnings and source review dates in each guide. Do not upgrade historical evidence to live verification.
- Use an explicitly managed native dialog, visible close control, title focus, Tab containment, Escape isolation, scroll restoration and trigger-based focus return. Prevent background command shortcuts and accidental backdrop dismissal after text selection.
- Use the existing visual tokens, a compact desktop dialog, a full-screen phone layout, safe-area spacing, 44px controls and reduced-motion-aware disclosure indicators.
- Add source actions to the item-details recipe evidence so its acquisition workflow matches the catalog and planner.

## Verification

The expanded browser suite tests spelling aliases, named modifiers, lazy panels, filter combinations, reset, keyboard boundaries, repeat opening, nested item-details dialogs and layouts at 320, 768 and 1440 pixels, in addition to the existing desktop and phone acquisition tests. CI also checks source coverage, exact recipe invariants, profession calculations, TypeScript/Vite production builds and integration idempotency.

The first implementation pass passed 106 browser cases, skipped 5 platform-specific cases, and found one missing acquisition entry point in the item-details drawer. The integration now supplies that entry point; the nested-dialog test remains unchanged. See the final PR review for the completed run and visual-check evidence.

## Release and rollback

Preserve the repository's deliberate deployment policy: merge only a passing reviewed head, then publish through one Git-triggered production release marker. Do not follow a Git-triggered release with a second API/manual deploy. The production baseline observed before release was Netlify deploy `6a82b00a5083eb0008d4abf7`; retain it as a rollback reference.
