# Mobile and Journey implementation review

Reviewed 17 September 2026. This records scope and observed checks, not an exhaustive game-data certification. Final commit-specific CI and deployment evidence belongs in PR #29.

## Correctness and preservation

- The source is now native React/TypeScript. Four build-time source-patching scripts and the obsolete Journey popup were removed; repeated builds verify that authored files stay unchanged. The one-time migration/export workflows were removed.
- Direct comparison of the before/after merged catalog preserved all 145 recipe records and all 105 item records (excluding runtime-generated image URLs from item equality).
- Six ingredients already referenced by those records were missing from the Materials index: Umber Hulk Mandible, Myrrh, Volcanic Salt, Wild Mint, Marilith Hair, and Lacquered Rothe Leather (accented catalog spelling). Index completion increased material entries from 67 to 73 without inventing recipes, yields, acquisition routes or artwork.
- All twelve dangling-reference findings are resolved. Zero structural blockers is not zero evidence gaps: 35 non-explicit yields, eight missing library recipes and 19 missing-art records remain visible.
- Readiness describes a full-path preparation checklist, not a minimum unlock gate. Its direct book budget is a published baseline rather than current pricing. Recording later tiers fills earlier checkpoints as an explicit tracking convention, not a game-eligibility assertion.

## Responsive and interaction checks

The main matrix visits Catalog, item detail, Plan, Materials, Reference, Journey, Readiness, Explorer and Recipe Graph/Data Health as specified by the test route set at 320, 390, 768, 1024 and 1440 pixels. Additional focused checks cover:

- Phone navigation on standalone pages, back behavior and the More workspace tools menu.
- Compare/View overlap; the newly reviewed Search/View placements use the header or tablet rail rather than hovering over instructions.
- Legacy important centered margins overriding tablet navigation clearance. Test the main/heading bounds against the actual rail, not only document overflow.
- Material selection scroll/focus; readiness action focus targets the visible card rather than the hidden desktop table.
- Search labels remain accessible without occupying input width.
- Mobile Explorer disclosure retains URL filter state through closing and reload.
- Nested source dialogs, Escape, focus restoration, source search aliases and unknown-source behavior.

Visual review is required in addition to passing browser checks. The 768px recipe capture exposed rail overlap despite an earlier green width-only matrix. Review actual captured pixels and keep strengthening behavioral assertions rather than interpreting no overflow as proof of usability.

Local TypeScript/Vite builds passed. The environment blocks local browser navigation, so functional browser evidence comes from GitHub Actions Chromium projects and downloaded screenshots, not a claimed successful local browser run. A timed-out remote browser attempt is not a passed live-site check.

## Journey and evidence coverage

Nine source-linked chapters cover Workshop access; the first gathering/crafting loop; profession leveling; premises upgrades; Chultan I/II; Sharandar; Menzoberranzan; tools/artisans/supplements; and production planning. The searchable library exposes every captured output: 177 named outputs from the current repository's item and recipe records. Expandable details distinguish exact yields, missing inputs and uncertainty. Prior five milestone IDs and saved user state are preserved.

The public claim ledger, dates, primary publisher links, creator sources and limitations are in `mobile-journey-review.md` and `src/data/journeyKnowledge.ts`. The expensive progression and morale assumptions removed from current-value fields must not be silently restored without new evidence.

**Not complete:** the full standard Level 1-20 and Chultan recipe inventories, all current per-item values, and a verified statement of the latest 2026 Masterwork tier. Existing Masterwork source uncertainties also remain. The UI documents these boundaries; 177 captured outputs must never be advertised as every recipe in the game.

## 18 September 2026 research-completion addendum

The Journey library now has three deliberately separated collections: the screenshot-backed Masterwork catalog, the 907-task standard-professions community snapshot, and a source-bounded Masterwork research reference. The Masterwork reference adds 16 Chultan intermediate ratios and 18 class weapon-slot formulas from the replacement community worksheet, but does not feed those historical formulas into planner calculations.

Targeted 2026 publisher review did not verify a Masterwork tier after Menzoberranzan. The UI therefore uses the narrower wording “latest positively documented tier” and explicitly says that absence from the reviewed roadmap/release articles is not proof that a later tier does not exist. Current Chultan final-output completeness and several current access/binding gates remain honest unknowns instead of guessed requirements.
