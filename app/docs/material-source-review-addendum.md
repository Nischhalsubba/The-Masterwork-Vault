# Acquisition review addendum - 17 September 2026

## Unresolved leather traced to its source

A bounded search of AsteR's `MW Recipes!A2:AA1040` for `Roth` returned exactly one matching row: row 88. A contiguous read of `MW Recipes!A80:H94` confirms that `F88` is **Lacquered Rothe Leather** (the source spells the e with a grave accent), quantity **3x** in `E88`, within **Mastered Duergar Mercenary's Restoration Sabatons**, whose output name is in `G86`.

This is evidence of ingredient usage, **not** an acquisition route or a recipe for that material. It supports retaining the exact catalog name with an unresolved source instead of silently substituting Goristro/Aberrant leather. The bounded search was complete for that tab, but absence there is not proof of absence from the game.

[Original cells](https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit#gid=1562621832&range=D86:G89)

## Review and correction

The first complete browser run passed 88 checks and failed the same evidence-filter label check on desktop and phone. The filter now has an explicit `aria-labelledby` pointing to the visible Evidence label; its option text no longer pollutes the accessible name. The test remains strict rather than weakening its locator.

The index now unions the complete explicit source registry with catalog sidebar materials, so a leaf does not disappear just because it lacks a sidebar entry. Search tolerates accent differences. Native modal key handling isolates Escape/Tab from an underlying recipe overlay.

CI now verifies that rerunning source integration changes neither patched source file and retains only the two acquisition preview PNGs for one day. Deployment triggers and Netlify policy remain unchanged.
