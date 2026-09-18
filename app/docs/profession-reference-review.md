# Profession reference expansion - 18 September 2026

## Scope and source

The existing responsive workspace and nine-chapter journey from PR #29 are preserved. The captured Underdark/Sharandar catalog remains the only data used for its existing planner calculations. A separate, on-demand **Standard professions** collection exposes the public community database's 907 task records, with 2,604 ingredient references resolved to 227 material identities.

Source: [Neverwinter Professions Database, public v1 task table](https://neverwinterdata.notion.site/fc4c4cfb802742ffb99a4f51c330a143). Its [17 April 2024 announcement](https://www.reddit.com/r/Neverwinter/comments/1c6a4i7/masterwork_crafting_material_list/) and public introduction request review for errors and describe the task-information work as unfinished. Retrieval is not a claim that the source was updated for the current game patch.

The table returned 907 row IDs with `hasMore=false`. The linked material collection, identified by following a public ingredient page, supplied all 227 referenced IDs. The older Materials v1 collection had different IDs and was not used to infer names. No account sign-in, access-control bypass or private data was used. Raw workspace/user metadata is excluded from the checked-in snapshot.

## Inventory and limits

| Profession | Source task records |
| --- | ---: |
| Alchemy | 84 |
| Armorsmithing | 143 |
| Artificing | 158 |
| Blacksmithing | 154 |
| Jewelcrafting | 107 |
| Leatherworking | 139 |
| Tailoring | 122 |

These are 907 source records, not 907 guaranteed distinct current outputs: four repeated profession/name pairs remain separate with their original source IDs. All 2,604 input quantities were present; no ingredient name or quantity was inferred.

**All output yields are null** because the table has no yield column. Two levels are missing: Gilded Blackiron Gauntlets and Black Opal. Three source conflicts are visibly flagged: Linseed Oil (Level 5, category 1-4), Bronze Helm (5, 1-4), and Aurochhide Tome (18, 19-20). Optional Morale, XP, Proficiency and Focus values remain null when absent. Commission/currency units, timings and current success rates are not derived from partial columns.

113 of the 227 referenced materials are marked Gatherable by this source. Those rows explain the documented Workshop Gathering route and recorded level, with an explicit current-task/tool check. A record not marked Gatherable is not described as unobtainable or as a vendor purchase. Source links and ingredient searches provide further investigation without inventing routes.

## Research cross-checks

The Journey retains publisher evidence for character Level 8 entry, the profession rescale to 20, the 2021 book-purchase change, the 2,500,000-credit Grand Upgrade correction, the 2023 tool changes and modern 2x Professions mechanics. The snapshot does not replace those progression rules.

Legacy Masterwork references (including Alchemy, Artificing, Blacksmithing and Armorsmithing IV/V) and older creator-spreadsheet leads were examined. Direct retrieval of several other pages was blocked. Old level-70 tables, incomplete IV/V inventories and removed commission quests are not sufficient for an exhaustive current Chultan inventory. No inferred modern Chultan recipes or wholesale legacy-level conversions were added. This gap stays tracked in #30, along with live book eligibility, missing captured yields and artwork. The interface does not claim current-game completeness.

## Implementation and safeguards

`import-profession-reference.py` is offline and deterministic. It reads two bounded public captures, resolves exact relation IDs and outputs only task/material facts. Reviewed snapshot SHA-256: `dd87d1d5e331d8a0705b59f74fc4ad9535095d4daf3a26631bba78e40dedc5fa`. Re-imports with changed inventory require a new review. There is no runtime connection to Notion or scheduled scraping.

`professionReference.ts` validates the bundled snapshot at its loading boundary and supplies pure immutable filters. The snapshot loads from the app's own static asset only after selecting Standard professions. Failed download/validation has an explicit retry state; unmount cancels the request. Only 30 summaries initially render; details mount on expansion. Reference tasks have no Add to plan action.

Tests cover the 907/227/2604 inventory, exact Honey/Beehive Chip link, absence of invented yields, unknown/conflicting levels, malformed data rejection, immutable filters, lazy result rendering, retry behavior and 320/390/768/1024/1440px reflow. Existing inventory and saved-plan code is untouched. Temporary network-capture and snapshot-write workflow files are removed before merge.
