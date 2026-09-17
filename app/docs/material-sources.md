# Material acquisition research

Reviewed: 2026-09-17. Scope: every raw/leaf ingredient referenced by the current Underdark and Sharandar catalog, including ordinary Workshop inputs. This is literature research, not a current in-game observation.

## Coverage and meaning

The inventory test discovers 44 distinct catalog leaves. Each has an explicit source record: 43 contain published acquisition guidance (some historical or incomplete) and one is unresolved. This is **100% record coverage, not 100% live verification**. Honey and Myrrh are crafted intermediates that the existing graph treats as leaves; their guides explain the extra crafting stage without silently rewriting screenshot-backed recipes.

Labels: **Published source** means a reviewed publication names the route, not that its current behavior was observed. **Historical guide** means version-sensitive, older or incompletely corroborated evidence. **Needs verification** supplies no invented farming route. Review dates are retrieval/research dates, not publication dates or game-patch certifications.

## Material-to-source inventory

| Materials | Published acquisition route | Limitation |
| --- | --- | --- |
| Fluorescent Flora; Mushroom Log | Menzoberranzan explorer chart | Launch-era spreadsheet; current chart seller/cost unverified |
| Faerzress Rock; Luminescent Darklake Water | Narbondellyn explorer chart | Same limitation; do not substitute the Menzoberranzan chart |
| Druegarsteel Scrap; Menzoberranzan Faerzress Crystal; Mushroom Droplet | Abyssal Hunts, Tricky Reversal | Pool rewards, not a guaranteed drop of every material |
| Drider Leg; Umber Hulk Mandible; Shroomsap Spores | Abyssal Hunts, Itty Bitty | Tier/modifier eligibility applies |
| Fungal Moss | Itty Bitty in the creator spreadsheet | Not corroborated by the reviewed wiki reward table; check reward tooltip |
| Marilith Hair; Demonweb Faerzress Crystal; Goristro Hide | Advanced Demonweb Pits | Launch-era difficulty mapping; boss/chest/rate not established |
| Fallen God's Ore; Perfect Marilith Hair; Abyssal Crystal | Master Demonweb Pits | Distinct from the Advanced pool |
| Calcified Webbing | Demonweb Pits campaign store | Current currency cost and unlock not established |
| Feywood Log; Hardened Blight Bark; Dryad Hair | Sharandar: The Grove explorer chart | 2021 guide |
| Weeping Willow's Tears; Shade Leaves; Shadowdemon's Eyes | Sharandar: The Mires explorer chart | 2021 guide |
| Troll's Earwax Resin; Silvertongue Moss; Soulfire Flies | Sharandar: The Ruins explorer chart | 2021 guide |
| Shard of Dawn's Light; Shattered Snowflakes; Displacer Beast's Whisker | Vault of Stars personal boss drops | No individual boss assignment/current difficulty claim |
| Corpse Flower Thorn | Vault of Stars Corpse Flowers, group roll | Not a personal boss drop |
| Terebinth; Alkali | Stronghold Atelier | Published historical prices are not live quotes |
| Aberrant Blood; Aberrant Bone; Beast Horn; Chamomile; Sugar Beet; Volcanic Salt; Wild Mint | Named Workshop Gathering tasks | Adventurer + task tool; old levels/timers not asserted as current |
| Honey | Gather Beehive Chip, then craft through Alchemy | Documented 1 chip -> 1 Honey; crafted, not gathered Honey |
| Myrrh | Gather Myrrh Branch, then craft through Alchemy | Documented 3 branches -> 1 Myrrh; names are not aliases |
| Questionable Piece of Leather | Historical New Sharandar undead/archer reports | Current exact English subzone and enemy remain uncertain |
| Lacquered Rothe Leather (catalog spelling includes an accent) | Unresolved | Do not equate it with other lacquered leathers without evidence |

## Evidence and provenance

The source records contain evidence URLs, supported claim, access method and review date for every route. The principal references are:

- AsteR, [Menzoberranzan MW spreadsheet](https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit#gid=1562621832), MW Recipes!A1:B1 and its rich-text color runs. The creator's spelling variants are normalized to catalog names. Color boundaries were read; plain text alone would misassign some groups.
- [Abyssal Hunts](https://neverwinter.fandom.com/wiki/Abyssal_Hunts): modifier reward table, Through the Tear unlock and zero-damage participation exclusion.
- [Cloak Alliance, Stronghold maps](https://cloakalliance.wordpress.com/2021/07/23/stronghold-maps-mod-21/), 2021-07-23: chart pools and activation steps.
- [Vault of Stars](https://neverwinter.fandom.com/wiki/Vault_of_Stars): personal boss material drops versus Corpse Flower group rolls.
- [New OutRiders guide](https://newoutriders.org/2023/01/13/temple-of-the-spider-queen-and-masterwork-weapons/), 2023-01-13, and [Terebinth](https://neverwinter.fandom.com/wiki/Terebinth): Atelier. [Alkali](https://neverwinter.fandom.com/wiki/Alkali) explicitly identifies Atelier too.
- [Gathering](https://neverwinter.fandom.com/wiki/Gathering), [Alchemy/Honey](https://neverwinter.fandom.com/wiki/Alchemy/Honey), [Myrrh](https://neverwinter.fandom.com/wiki/Myrrh): ordinary profession tasks and crafted intermediates. Legacy levels and inferred tool assignments are deliberately excluded.
- Questionable Piece of Leather: Russian wiki obtaining section and [2022 player reply](https://www.reddit.com/r/Neverwinter/comments/y7j9b3/questionable_piece_of_leather/). The English wiki target returned 404. The reply identifies part-2 archers; a follow-up question about Festering Rangers is not confirmation. The in-app record links the actual Russian source and explains the uncertainty.

Community wikis and guild/player reports are not publisher guarantees. The creator spreadsheet is primary evidence for what its author recorded, not primary evidence of today's game state. No unverified video transcript, drop probability, guaranteed loot, auction price, current vendor stock or exact node coordinate is claimed.

## Known gaps

1. Lacquered Rothe Leather: exact catalog ingredient not matched to an attributable route/recipe after exact-name and spelling-variant research. It may require a catalog identity correction; no substitution was made.
2. Fungal Moss: launch-era Itty Bitty mapping is not independently corroborated by the reviewed reward table.
3. Questionable Piece of Leather: exact current subzone/enemy remains uncertain despite historical leads.
4. Current chart sellers/costs, boss assignments, probabilities, binding and current unlock levels are not fully established. The UI states these limitations at the affected route.
5. Auction House/trading is not added indiscriminately: tradability and current listings were not verified for each item.

## Implementation

`src/data/materialSources.ts` is the typed source registry. `MaterialSources.tsx` supplies a searchable index, inline raw-material panel and accessible modal. Sources are linked from raw recipe inputs, raw dependency-tree nodes, Materials and the acquisition checklist. Recipe provenance is kept separate.

`apply-material-source-integration.mjs` follows this repository's existing prebuild integration convention. Every anchor is unique and fails closed on drift; the pass is idempotent. The predev hook also runs integration so development is not missing the feature.

## Verification and maintenance

Run `npm run verify:sources`, `npm run build`, then `npx playwright test`. The coverage test discovers leaves from the compressed catalog and both supplements; adding an unrecorded leaf fails the build. It also checks aliases, HTTPS evidence, uncertainty behavior and Advanced/Master distinctions. Browser tests cover index search/filtering, focus restoration, linked evidence, raw recipe dialogs, Materials details and phone overflow.

To update a route, read a source that explicitly supports that exact item, update its evidence and review date, preserve uncertainty and rerun the checks. Do not convert a cached page retrieval date into a current-game verification badge. No production deploy is implied by a passing branch build.
