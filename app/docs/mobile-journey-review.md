# Mobile workspace and Masterwork Journey

Literature reviewed: 17 September 2026. Not a live in-game certification.

## Reproduced defects

At 320px, Compare and View overlapped by 1,584 square pixels. Selecting Mushroom Log left its heading outside the viewport. Journey, Readiness, Explore, Graph and Data Health did not mount mobile navigation. Regression commit d3b42a508827465accb26f481637573cb2027039 reproduced all seven cases in both browser projects: 14 failures, 112 passed, ten platform-specific skips. The earlier width-only matrix passed. No horizontal overflow did not mean the mobile interface was usable.

## Implementation and acceptance

One shared route-aware phone/tablet shell serves all nine main routes, with five phone destinations and a More tools menu. Header and floating controls have separate positions. Recipes wrap; material and graph pickers have contained scrolling; mobile Explorer filters use disclosure. Material selection scrolls and focuses its detail heading.

Journey has nine sourced chapters: Workshop unlock, first gather/craft, profession leveling, premises upgrades, Chultan I/II, Sharandar, Menzoberranzan, preparation and production. Existing local milestone IDs are preserved. Stage links are shareable. Reading progress is not game-character eligibility.

A searchable union of all 105 item and 145 recipe records exposes 177 distinct named outputs, including eight missing recipes. Unmatched or non-explicit yields stay unknown. Quality identities remain distinct; conflicting item/recipe inputs cannot silently provide a yield. Every captured output is reachable through filters and Show more.

Published book prices have one shared source. Restoration calculations require the user's live Morale quote. The event switch is an explicit scenario. The source ledger distinguishes publication dates, review dates and current-game uncertainty. Data Health reads acquisition status from the actual source registry.

The existing build-time JSX integrations are converted once into ordinary App and CraftingWorkbench source, and then removed along with the unused legacy Journey popup. Builds generate catalog data only; repeat builds must leave authored source unchanged. Temporary migration and source-export workflows must be removed before merge.

## Evidence

| Claim | Attributable source | Limitation |
| --- | --- | --- |
| Level 8 entry; profession/artisan cap rescale to 20 | [Publisher, 16 July 2021](https://www.playneverwinter.com/en/news-details/11491453) | Published change, not live observation |
| Ordered books; old Artisan storyline removed; 500,000 AD Stronghold books and 1,500,000 AD Sharandar books | [Publisher, 18 October 2021](https://www.playneverwinter.com/en/news-details/11500323) | Does not establish that every Workshop/guild restriction is absent |
| Grand Upgrade reduced to 2,500,000 credits | [Publisher, 18 July 2023](https://www.playneverwinter.com/en/news-details/11548793) | South Sea credits, not AD |
| Masterwork alembics assigned to Armorsmithing books | [Publisher, 6 November 2023](https://www.playneverwinter.com/en/news-details/11557773) | Later correction to old book assignments |
| Chultan to Sharandar, Stryker Bronzepin | [Northside, 4 May 2022](https://www.youtube.com/watch?v=3xwjYNyqucI) | All-seven demonstration, not proof of minimum one-profession eligibility |
| Narbondellyn introduction | [AsteR, 10 June 2023](https://www.youtube.com/watch?v=vKzNukCArpI) | Explicit preview-server recording |
| Per-profession book costs 500,000 / 500,000 / 1,500,000 / 1,500,000 AD | [AsteR, MW Unlock Prices!A1:E10](https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit#gid=1959449797) | Bounded cell read; historical budget baseline, not live prices. 4m per full path; 28m for seven |
| Workshop roles and 400 daily Morale | [Community profession reference](https://neverwinter.fandom.com/wiki/Profession) | Mixed-era page; old quest gates explicitly outdated |
| 2x halves Morale, doubles Masterwork nodes, no doubled task XP | [Publisher, 21 June 2022](https://www.playneverwinter.com/en/news-details/11519393) | Event rules, not a claim that an event is currently active |

## Evidence gaps

Exact rescaled quest levels 5/8/10/13/15, capacities 11/17/23/29, a fixed 120 AD restoration rate, mandatory all-seven later-book gates and character-binding claims were not adequately supported. Their current-value fields stay unset. Calculation tests certify behavior for given inputs, not live game mechanics.

Standard Level 1-20 and Chultan recipe inventories are not fully captured. The library covers this repository, not every game recipe. Subsequent Masterwork tiers, exact current introduction quest labels, minimum cross-profession requirements, binding and guild gates remain unverified. No XP curve, drop rate, current price or missing recipe was invented.

Existing material-source limitations remain: Lacquered Rothe Leather unresolved; Fungal Moss historical mapping lacks independent corroboration; exact current Questionable Piece of Leather enemy/subzone uncertain.

## Verification protocol

Production build includes source coverage, critical exact recipes, knowledge uncertainty, profession calculations and Journey source/catalog checks. Playwright covers all-route bounds, overlapping controls, material selection, shared navigation, Journey deep links, preservation of old milestones, library search, budget inputs and honest evidence display. Review generated screenshots and actual CI results. This document does not pre-claim passing CI or deployment.
