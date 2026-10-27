# Masterwork Vault — artwork source and replacement register

Date: 2026-10-27. This register separates original/captured game images from generic reference art. Do not equate “renderable” with “authentic”.

## Existing sources in the repository

- `src/data/icons/iconData*.ts`: embedded original icon records
- `src/data/recoveredIcons*.ts`, `src/data/materialIconOverrides.ts` and `src/data/gatheringMaterialIconOverrides.ts`: recovered and reviewed material art
- `src/data/sharandarSprite*.ts`, `src/data/sharandarVerifiedWeaponIcons.ts`: Sharandar screenshot-derived and verified weapon artwork
- `src/data/verifiedIconIndex.ts`: 90 verified atlas positions
- `src/data/classIcons.ts`: class emblems hotlinked to NW Hub, with text fallbacks when unavailable
- `src/data/referenceIcons.ts`: generic category illustrations, NOT verified item art
- `src/data/catalog.ts`: per-entry image provenance and clearly separated coverage diagnostics

## External reference candidates (NOT automatically licensed or confirmed as exact matches)

1. Neverwinter's in-game workshop and inventory as the primary source of exact art: https://www.playneverwinter.com/
2. Neverwinter Wiki icon files and individual image pages: https://neverwinter.fandom.com/wiki/Category:Icons
3. Neverwinter Wiki profession and material names: https://neverwinter.fandom.com/wiki/Category:Professions
4. Class emblems currently referenced by the app: https://nw-hub.com/classes

The wiki identifies community content under Creative Commons terms unless otherwise indicated, but game artwork, logos and individual images may be subject to separate rights. **A wiki image being publicly reachable is not permission to redistribute it.**

## Replacement acceptance criteria

For each item/material: verify (a) exact in-game name and variant, (b) matching image pixel content, (c) era/version, (d) source URI and evidence, (e) ownership/permission to redistribute, and (f) local file rendering. Maintain `artwork.provenance` and source ID. A category illustration stays explicitly labeled until verification succeeds. Never assign a vaguely similar icon to a differently named material.

## Current release behavior

- Work-order materials now display existing catalog artwork, with a neutral fallback when the source is absent or broken.
- The selected item's generic fallback is labeled “Representative item artwork”.
- External class images retain a text fallback when the host fails or hasn't finished loading.
- No unsourced external images were downloaded in this change.
- The console icon audit explicitly separates existing/original icons from reference-derived fallbacks and missing visuals.

## Open review tasks

- Review all existing source metadata for exactness.
- Confirm external file permission and availability before bundling new item icons.
- Use a browser screenshot audit to verify image decoding and responsive sizing across routes.
- Build an actual item-by-item coverage export; current counts are runtime diagnostics, not a separately verified release report.
