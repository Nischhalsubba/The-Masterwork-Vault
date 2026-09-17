/** Acquisition evidence is separate from screenshot-backed recipe quantities.
 * A reviewed publication is not a live in-game confirmation. See docs/material-sources.md.
 */
export type AcquisitionStatus = 'documented' | 'historical' | 'unresolved'
export type AcquisitionMethod = 'Explorer chart' | 'Abyssal hunt' | 'Dungeon drop' | 'Campaign store' | 'Stronghold vendor' | 'Workshop gathering' | 'Workshop crafting' | 'Enemy drop'
export type SourceEvidence = {
  title: string; url: string; supports: string; checkedAt: string
  access: 'spreadsheet-cells' | 'full-page' | 'page-extract' | 'indexed-excerpt'
  publishedAt?: string
}
export type AcquisitionRoute = {
  id: string; method: AcquisitionMethod; location: string; requirements: string[]
  steps: string[]; caveats: string[]; evidence: SourceEvidence[]
}
export type MaterialSourceGuide = {
  name: string; aliases: string[]; scope: string; reviewedAt: string; status: AcquisitionStatus
  routes: AcquisitionRoute[]; notes: string[]; researchLeads?: SourceEvidence[]
}
export const MATERIAL_SOURCES_REVIEWED_AT = '2026-09-17'
export const MATERIAL_SOURCES_NOTICE = 'Literature reviewed 17 September 2026, not verified in-game. Historical guides describe their published game version. Check current reward tooltips, unlocks and prices before spending currency or organizing a run.'
const evidence = (title: string, url: string, supports: string, access: SourceEvidence['access'], publishedAt?: string): SourceEvidence => ({ title, url, supports, access, publishedAt, checkedAt: MATERIAL_SOURCES_REVIEWED_AT })
const sheet = evidence('AsteR: Menzoberranzan MW, MW Recipes!A1:B1', 'https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit#gid=1562621832', 'Material-to-source groups in cells A1:B1, checked against rich-text color boundaries. Launch-era reference; not proof of current drop rates.', 'spreadsheet-cells')
const hunts = evidence('Neverwinter community wiki: Abyssal Hunts', 'https://neverwinter.fandom.com/wiki/Abyssal_Hunts', 'Tricky Reversal and Itty Bitty reward pools; Through the Tear unlock; players doing zero damage do not receive modifier rewards. Fungal Moss is not corroborated by this reward table.', 'page-extract')
const sharandarMaps = evidence('Cloak Alliance: Stronghold maps, module 21', 'https://cloakalliance.wordpress.com/2021/07/23/stronghold-maps-mod-21/', 'Grove, Mires and Ruins chart material pools and chart activation procedure. Historical guide, not current vendor stock.', 'full-page', '2021-07-23')
const vault = evidence('Neverwinter community wiki: Vault of Stars', 'https://neverwinter.fandom.com/wiki/Vault_of_Stars', 'Personal boss drops for the three named boss materials; Corpse Flower Thorn drops from Corpse Flowers with a group roll. No individual boss-to-material assignment is established.', 'page-extract')
const vendor = evidence('New OutRiders: masterwork materials guide', 'https://newoutriders.org/2023/01/13/temple-of-the-spider-queen-and-masterwork-weapons/', 'Terebinth at the Stronghold Atelier for Guild Marks; historical price only.', 'full-page', '2023-01-13')
const treeResin = evidence('Neverwinter community wiki: Terebinth', 'https://neverwinter.fandom.com/wiki/Terebinth', 'Identifies the Atelier as the purchasing source. The page labels its game-version information as potentially earlier than module 22.', 'indexed-excerpt')
const gathering = evidence('Neverwinter community wiki: Gathering', 'https://neverwinter.fandom.com/wiki/Gathering', 'Named Workshop gathering tasks for the ordinary materials, Beehive Chip and Myrrh Branch; an Adventurer and the appropriate task tool are required. Legacy levels and timers are not used as current prerequisites.', 'page-extract')
const honey = evidence('Neverwinter community wiki: Alchemy/Honey', 'https://neverwinter.fandom.com/wiki/Alchemy/Honey', 'Alchemy task: one Beehive Chip produces one Honey (or its +1 result). This is a crafted input, not the gathering output.', 'full-page')
const myrrh = evidence('Neverwinter community wiki: Myrrh', 'https://neverwinter.fandom.com/wiki/Myrrh', 'Alchemy task: three Myrrh Branch produce one Myrrh (or its +1 result). Myrrh and Myrrh Branch are different materials.', 'indexed-excerpt')
const alkali = evidence('Neverwinter community wiki: Alkali', 'https://neverwinter.fandom.com/wiki/Alkali', 'Atelier purchase; the page lists a historical cost of 2,000 Guild Marks and warns its game-version data may predate module 22.', 'page-extract')
const leatherWiki = evidence('Neverwinter community wiki (Russian): Questionable Piece of Leather', 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%BE%D0%BC%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D0%BA%D1%83%D1%81%D0%BE%D0%BA_%D0%BA%D0%BE%D0%B6%D0%B8', 'The obtaining section says this can drop from undead in the grove area of New Sharandar. The translated subzone label is not treated as a verified current English map name.', 'full-page')
const leatherReport = evidence('Player report: farming Questionable Piece of Leather', 'https://www.reddit.com/r/Neverwinter/comments/y7j9b3/questionable_piece_of_leather/', 'A 2022 reply points to archers in Sharandar part 2. The later mention of Festering Rangers is a question, not independent confirmation of that exact enemy.', 'full-page', '2022-10-18')

const slug = (name: string) => name.normalize('NFKC').toLowerCase().replace(/\s*\+1\s*$/, '').replace(/[\u2018\u2019']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const aliases: Record<string, string> = {
  'duergarsteel-scrap': 'druegarsteel-scrap',
  'flourescent-flora': 'fluorescent-flora',
  'luminiscent-darklake-water': 'luminescent-darklake-water',
  'menzborezzanzan-faerzress-crystal': 'menzoberranzan-faerzress-crystal',
  'shadow-demon-eyes': 'shadowdemons-eyes',
  'soul-fireflies': 'soulfire-flies',
  'lacquered-rothe-leather': 'lacquered-roth-leather',
}
export function normalizeMaterialSourceName(name: string): string { const key = slug(name); return aliases[key] ?? key }
const record = (name: string, scope: string, route: AcquisitionRoute, status: AcquisitionStatus = 'historical', notes: string[] = []): MaterialSourceGuide => ({ name, aliases: Object.keys(aliases).filter((key) => aliases[key] === slug(name)), scope, reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status, routes: [{ ...route, id: `${route.id}-${slug(name)}` }], notes: notes.length ? notes : ['Acquisition source is documented at the linked reference date; current yields, drop rates and binding are not verified.'] })
const chart = (zone: string): AcquisitionRoute => ({
  id: `chart-${slug(zone)}`, method: 'Explorer chart', location: zone,
  requirements: [`Access to ${zone}`, `The matching Explorer's Case / Chart: ${zone}`],
  steps: [`Obtain the explorer case or chart explicitly named for ${zone}. Confirm its current seller, unlock and cost before purchasing.`, 'Open the case, use the chart and accept its gathering quest.', 'Travel to the chart zone and collect its marked resource nodes. The Explorer Case Maps tab in the linked spreadsheet contains the historical maps.'],
  caveats: ['Materials share a chart pool; a particular material is not guaranteed at every node.', 'The reviewed evidence confirms the chart zone, not the current seller, price, node coordinates or profession prerequisites.'], evidence: [sheet],
})
const hunt = (modifier: string): AcquisitionRoute => ({
  id: `hunt-${slug(modifier)}`, method: 'Abyssal hunt', location: 'Abyssal Hunts - Menzoberranzan / Narbondellyn',
  requirements: ['Unlock Abyssal Hunts through the Demonweb Pits campaign quest Through the Tear.', `An available hunt and the ${modifier} modifier; inspect the current reward preview.`],
  steps: ['Assemble a group appropriate for the hunt and enter through its Abyssal Tear.', `Select ${modifier} before starting; confirm the desired material appears in its reward pool.`, 'Defeat the hunt and contribute damage, then check your modifier rewards. The wiki states that zero damage earns no modifier rewards.'],
  caveats: ['A reward pool is not a guaranteed drop of every listed material.', 'Tier and modifier availability affect rewards. No live drop rate or guaranteed quantity is asserted.'], evidence: [hunts, sheet],
})
const dungeon = (difficulty: 'Advanced' | 'Master'): AcquisitionRoute => ({
  id: `demonweb-${difficulty.toLowerCase()}`, method: 'Dungeon drop', location: `Demonweb Pits (${difficulty})`,
  requirements: ['Campaign and queue access for this difficulty; check current item-level and group requirements in-game.'],
  steps: [`Choose Demonweb Pits on ${difficulty}; do not substitute another difficulty with a different material pool.`, 'Complete the dungeon encounters and inspect earned drops/rewards for the exact material name.', 'Repeat eligible runs as needed after confirming the current reward pool.'],
  caveats: ['The launch-era reference identifies the difficulty, not a guaranteed boss, chest, quantity or probability.', 'Marilith Hair and Perfect Marilith Hair are distinct resources, not interchangeable aliases.'], evidence: [sheet],
})
const sharandarChart = (zone: string): AcquisitionRoute => ({
  id: `sharandar-${slug(zone)}`, method: 'Explorer chart', location: `New Sharandar - ${zone}`,
  requirements: ['Access to the corresponding New Sharandar area.', `The matching Explorer's Chart: Sharandar - ${zone}.`],
  steps: [`Check Stronghold explorer-chart stock for the Sharandar ${zone} case; the 2021 guide uses Guild Marks. Confirm current availability before buying.`, 'Open the case, use the chart and accept its quest.', 'Follow the quest trail to that chart\'s resource nodes in New Sharandar and collect the materials.'],
  caveats: ['This module-21 guide is not a live stock check. Current profession and vendor unlocks must be checked in-game.', 'The chart contains a material pool. Current quantities and profession-event bonuses are not verified.'], evidence: [sharandarMaps],
})
const vaultBoss: AcquisitionRoute = {
  id: 'vault-boss', method: 'Dungeon drop', location: 'Vault of Stars - boss encounters',
  requirements: ['The wiki identifies Uncovering the Threat in the Sharandar campaign as the dungeon unlock. Check current queue access and difficulty.'],
  steps: ['Run Vault of Stars with an appropriate group and defeat its bosses.', 'Inspect your personal boss drops for the exact named material.', 'Repeat eligible encounters as needed; the reference does not establish a guaranteed drop.'],
  caveats: ['The reviewed source does not assign each material to an individual named boss or distinguish current difficulty variants.', 'These personal boss drops differ from the Corpse Flower group-roll material.'], evidence: [vault],
}
const gather = (name: string): AcquisitionRoute => ({
  id: 'workshop-gathering', method: 'Workshop gathering', location: `Workshop - Gathering - ${name}`,
  requirements: ['Workshop and Gathering task access.', 'An available Adventurer, the tool required by the task, and its commission.'],
  steps: ['Open the Workshop Gathering task list.', `Select the task whose output is ${name}; check the output name rather than recipes that merely consume it.`, 'Assign an Adventurer and the tool shown by that task, then start the order.', 'Collect completed gathering results from the Workshop delivery box and repeat for the amount needed.'],
  caveats: ['This is a profession task, not evidence that killing a similarly named creature in an adventure zone will drop the material.', 'Legacy profession levels, timers, tool guesses and success/quality chances are not presented as current guarantees. Check the current task panel.'], evidence: [gathering],
})
export const materialSourceRecords: MaterialSourceGuide[] = [
  ...['Fluorescent Flora', 'Mushroom Log'].map((name) => record(name, 'Underdark', chart('Menzoberranzan'))),
  ...['Faerzress Rock', 'Luminescent Darklake Water'].map((name) => record(name, 'Underdark', chart('Narbondellyn'))),
  ...['Druegarsteel Scrap', 'Menzoberranzan Faerzress Crystal', 'Mushroom Droplet'].map((name) => record(name, 'Underdark', hunt('Tricky Reversal'), 'documented')),
  ...['Drider Leg', 'Umber Hulk Mandible', 'Shroomsap Spores'].map((name) => record(name, 'Underdark', hunt('Itty Bitty'), 'documented')),
  record('Fungal Moss', 'Underdark', { ...hunt('Itty Bitty'), evidence: [sheet] }, 'historical', ['The launch-era spreadsheet places Fungal Moss in the Itty Bitty group. The reviewed wiki reward table does not independently corroborate it; verify the modifier tooltip before farming.']),
  ...['Marilith Hair', 'Demonweb Faerzress Crystal', 'Goristro Hide'].map((name) => record(name, 'Underdark', dungeon('Advanced'))),
  ...["Fallen God's Ore", 'Perfect Marilith Hair', 'Abyssal Crystal'].map((name) => record(name, 'Underdark', dungeon('Master'))),
  record('Calcified Webbing', 'Underdark', {
    id: 'campaign-webbing', method: 'Campaign store', location: 'Demonweb Pits campaign store',
    requirements: ['Demonweb Pits campaign store access and the currencies shown by the current listing.'],
    steps: ['Open the Demonweb Pits campaign and its store.', 'Locate Calcified Webbing and inspect its unlock, currency and quantity per purchase.', 'Acquire the required campaign currency and purchase the amount needed for your plan.'],
    caveats: ['The source names the store but does not establish a current price, currency quantity or unlock milestone.'], evidence: [sheet],
  }),
  ...['Feywood Log', 'Hardened Blight Bark', 'Dryad Hair'].map((name) => record(name, 'Sharandar', sharandarChart('The Grove'))),
  ...["Weeping Willow's Tears", 'Shade Leaves', "Shadowdemon's Eyes"].map((name) => record(name, 'Sharandar', sharandarChart('The Mires'))),
  ...["Troll's Earwax Resin", 'Silvertongue Moss', 'Soulfire Flies'].map((name) => record(name, 'Sharandar', sharandarChart('The Ruins'))),
  ...["Shard of Dawn's Light", 'Shattered Snowflakes', "Displacer Beast's Whisker"].map((name) => record(name, 'Sharandar', vaultBoss, 'documented')),
  record('Corpse Flower Thorn', 'Sharandar', {
    id: 'corpse-flower', method: 'Dungeon drop', location: 'Vault of Stars - Corpse Flowers',
    requirements: ['Vault of Stars access and a group; check current loot rules.'],
    steps: ['Enter Vault of Stars and defeat Corpse Flower enemies.', 'Check for the Corpse Flower Thorn drop and participate in the group loot roll when offered.', 'Repeat eligible encounters as needed; winning the group roll is not guaranteed.'],
    caveats: ['The wiki describes this as a group-roll drop, unlike the personal boss materials.', 'No current probability, respawn farm or difficulty-specific guarantee is established.'], evidence: [vault],
  }, 'documented'),
  record('Terebinth', 'Shared', {
    id: 'atelier-terebinth', method: 'Stronghold vendor', location: 'Stronghold - Atelier',
    requirements: ['Access to a Stronghold with the Atelier vendor available.', 'Guild Marks and any current vendor/profession unlocks.'],
    steps: ['Visit the Atelier vendor at an eligible Stronghold.', 'Find Terebinth and verify its current Guild Mark price and purchase quantity.', 'Purchase the amount needed. If the vendor is unavailable, check with the guild about structure availability.'],
    caveats: ['A 2023 guide reports 400 Guild Marks per unit; this is historical, not a current price guarantee.'], evidence: [vendor, treeResin],
  }),
  record('Alkali', 'Shared', {
    id: 'atelier-alkali', method: 'Stronghold vendor', location: 'Stronghold - Atelier',
    requirements: ['Access to an available Atelier vendor in a Stronghold.', 'The Guild Marks and unlocks currently required by that vendor.'],
    steps: ['Visit the Stronghold Atelier and find Alkali in its stock.', 'Check the purchase quantity, unlock requirements and current price.', 'Purchase the amount required for the crafting plan.'],
    caveats: ['The wiki lists 2,000 Guild Marks as a historical price and marks its game-version information as potentially earlier than module 22. It is not a live quote.'], evidence: [alkali],
  }),
  ...['Aberrant Blood', 'Aberrant Bone', 'Beast Horn', 'Chamomile', 'Sugar Beet', 'Volcanic Salt', 'Wild Mint'].map((name) => record(name, 'Shared / Workshop', gather(name))),
  record('Honey', 'Shared / Workshop', {
    id: 'alchemy-honey', method: 'Workshop crafting', location: 'Workshop - Alchemy - Honey',
    requirements: ['Alchemy task access, an Alchemist and the task tool.', 'Beehive Chip: the documented recipe uses one chip per one Honey.'],
    steps: ['Gather Beehive Chip through the Workshop Gathering task of that name using an Adventurer and its required tool.', 'Collect the chips, then open Alchemy and choose Honey.', 'Assign an Alchemist, supply the chip and pay the commission shown by the current task.', 'Collect the crafted Honey. Match the required quality before using it in the final recipe.'],
    caveats: ['Honey is a crafted intermediate even though the current catalog stops its dependency graph here.', 'This source guide does not silently change the screenshot-backed recipe graph. Check current task quantities and quality outcomes.'], evidence: [honey, gathering],
  }, 'historical', ['Crafted input, not a raw gathering drop: Beehive Chip -> Alchemy -> Honey.']),
  record('Myrrh', 'Shared / Workshop', {
    id: 'alchemy-myrrh', method: 'Workshop crafting', location: 'Workshop - Alchemy - Myrrh',
    requirements: ['Alchemy task access, an Alchemist and the task tool.', 'Myrrh Branch: the documented recipe uses three branches per one Myrrh.'],
    steps: ['Run the Workshop Gathering task for Myrrh Branch and collect its results.', 'Open Alchemy and select Myrrh, not Myrrh Branch.', 'Supply the branches, assign an Alchemist and the required tool, then start the task.', 'Collect the Myrrh and check its quality before using it.'],
    caveats: ['Myrrh and Myrrh Branch are not aliases. Myrrh is a crafted intermediate even though this catalog stops its dependency graph here.', 'The reference uses legacy profession levels; the current task panel is authoritative for unlocks, commission and outcomes.'], evidence: [myrrh, gathering],
  }, 'historical', ['Crafted input, not a raw gathering drop: Myrrh Branch -> Alchemy -> Myrrh.']),
  record('Questionable Piece of Leather', 'Sharandar', {
    id: 'sharandar-undead', method: 'Enemy drop', location: 'New Sharandar - undead enemies (historical reports)',
    requirements: ['Access to the relevant New Sharandar adventure area.'],
    steps: ['The Russian community wiki identifies undead in the grove area of New Sharandar as a possible source.', 'A 2022 player reply narrows the farming lead to archers in Sharandar part 2. Check the current enemy and zone before investing in a long farm.', 'Defeat eligible enemies and inspect their loot for the exact material; a drop is not guaranteed.'],
    caveats: ['This combines a community-wiki entry with an older player report, not a current in-game observation.', 'The exact current English subzone name, specific enemy, drop rate and any profession unlock are not confirmed. Festering Rangers was suggested in a question, not verified by the reviewed reply.'], evidence: [leatherWiki, leatherReport],
  }, 'historical', ['Published farming leads exist, but exact current enemy/subzone details remain uncertain.']),
  { name: 'Lacquered Roth\u00e8 Leather', aliases: ['Lacquered Rothe Leather'], scope: 'Catalog leaf - source unresolved', reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status: 'unresolved', routes: [], notes: ['The catalog references this exact ingredient, but reviewed sources did not establish a matching acquisition route or crafting recipe.', 'Do not substitute Lacquered Aberrant Leather, Lacquered Aged Leather or another similarly named leather without item/recipe evidence.', 'A current tooltip or attributable recipe source is needed. Missing documentation does not prove the material is unavailable.'] },
]
const sourceByName = new Map(materialSourceRecords.map((row) => [normalizeMaterialSourceName(row.name), row]))
export function getMaterialSourceGuide(name: string): MaterialSourceGuide {
  return sourceByName.get(normalizeMaterialSourceName(name)) ?? { name, aliases: [], scope: 'Unclassified', reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status: 'unresolved', routes: [], notes: ['No acquisition route has been verified for this exact material. A missing route is not evidence that the item is unavailable.', 'Check the exact item tooltip or submit an attributable acquisition source before a farming route is added.'] }
}
