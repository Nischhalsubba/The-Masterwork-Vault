/** Acquisition evidence is independent of screenshot-backed recipe quantities.
 * Reviewed sources are not a claim of live, in-game verification. See docs/material-sources.md.
 */
export type AcquisitionStatus = 'documented' | 'historical' | 'unresolved'
export type AcquisitionMethod = 'Explorer chart' | 'Abyssal hunt' | 'Dungeon drop' | 'Campaign store' | 'Stronghold vendor'
export type SourceEvidence = {
  title: string; url: string; supports: string; checkedAt: string
  access: 'spreadsheet-cells' | 'video-transcript' | 'full-page' | 'indexed-excerpt'
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
const sheet = evidence('AsteR: Menzoberranzan MW, MW Recipes!A1:B1', 'https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit#gid=1562621832', 'Material-to-source groups in cells A1:B1, including rich-text color boundaries. Launch-era reference; not proof of current drop rates.', 'spreadsheet-cells')
const video = evidence('AsteR: M26 masterwork document walkthrough', 'https://www.youtube.com/watch?v=X0HaToLcakE', 'Explains explorer, hunt, Advanced dungeon, Master dungeon and campaign-store source groups and the spreadsheet color legend.', 'video-transcript', '2023-07-16')
const hunts = evidence('Neverwinter community wiki: Abyssal Hunts', 'https://neverwinter.fandom.com/wiki/Abyssal_Hunts', 'Tricky Reversal and Itty Bitty reward pools, Through the Tear unlock and reward participation caveat. Indexed table; live page fetch unavailable.', 'indexed-excerpt')
const sharandarMaps = evidence('Cloak Alliance: Stronghold maps, module 21', 'https://cloakalliance.wordpress.com/2021/07/23/stronghold-maps-mod-21/', 'Grove, Mires and Ruins chart material pools and chart activation procedure. Published before later profession changes.', 'full-page', '2021-07-23')
const vault = evidence('Neverwinter community wiki: Vault of Stars', 'https://neverwinter.fandom.com/wiki/Vault_of_Stars', 'Personal boss material drops and Corpse Flower Thorn group-roll drops from Corpse Flowers; exact current difficulty and boss attribution not established.', 'indexed-excerpt')
const vendor = evidence('New OutRiders: masterwork materials guide', 'https://newoutriders.org/2023/01/13/temple-of-the-spider-queen-and-masterwork-weapons/', 'Terebinth at the Stronghold Atelier for Guild Marks. Historical guide; current vendor access and price must be checked.', 'full-page', '2023-01-13')
const treeResin = evidence('Neverwinter community wiki: Terebinth', 'https://neverwinter.fandom.com/wiki/Terebinth', 'Atelier vendor source for Terebinth.', 'indexed-excerpt')
const leatherLead = evidence('Player report: Questionable Piece of Leather', 'https://www.reddit.com/r/Neverwinter/comments/pxj5ny/what_do_you_do_with_the_questionable_piece_of/', 'A player reports a drop in New Sharandar. Does NOT establish a specific enemy, activity, vendor or repeatable farming method.', 'full-page', '2021-09-28')

const slug = (name: string) => name.normalize('NFKC').toLowerCase().replace(/\s*\+1\s*$/, '').replace(/[\u2018\u2019']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const aliases: Record<string, string> = {
  'duergarsteel-scrap': 'druegarsteel-scrap',
  'flourescent-flora': 'fluorescent-flora',
  'luminiscent-darklake-water': 'luminescent-darklake-water',
  'menzborezzanzan-faerzress-crystal': 'menzoberranzan-faerzress-crystal',
  'shadow-demon-eyes': 'shadowdemons-eyes',
  'soul-fireflies': 'soulfire-flies',
}
export function normalizeMaterialSourceName(name: string): string { const key = slug(name); return aliases[key] ?? key }
const record = (name: string, scope: string, route: AcquisitionRoute, status: AcquisitionStatus = 'historical', notes: string[] = []): MaterialSourceGuide => ({ name, aliases: Object.keys(aliases).filter((key) => aliases[key] === slug(name)), scope, reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status, routes: [{ ...route, id: `${route.id}-${slug(name)}` }], notes: notes.length ? notes : ['Acquisition source is documented at the linked reference date; current yields, drop rates and binding are not verified.'] })
const chart = (zone: string): AcquisitionRoute => ({
  id: `chart-${slug(zone)}`, method: 'Explorer chart', location: zone,
  requirements: [`Access to ${zone}`, `The matching Explorer's Case / Chart: ${zone}`],
  steps: [`Find the explorer case for ${zone}; check the current campaign vendor/store for its unlock and cost.`, 'Open the case, use the chart and accept its gathering quest.', 'Travel to the chart zone and collect its marked resource nodes. Use the Explorer Case Maps tab in the linked spreadsheet for the historical map.'],
  caveats: ['Materials share a chart pool; a particular material is not guaranteed at every node.', 'Exact current vendor, price, coordinates and profession prerequisites are not verified. Do not substitute a different region chart.'], evidence: [sheet, video],
})
const hunt = (modifier: string): AcquisitionRoute => ({
  id: `hunt-${slug(modifier)}`, method: 'Abyssal hunt', location: 'Abyssal Hunts - Menzoberranzan / Narbondellyn',
  requirements: ['Unlock Abyssal Hunts through the Demonweb Pits campaign (Through the Tear).', `An available hunt and the ${modifier} modifier; inspect its current reward preview.`],
  steps: ['Assemble a group appropriate for the hunt and enter through its Abyssal Tear.', `Select ${modifier} before starting; confirm the desired material appears in that modifier's reward pool.`, 'Defeat the hunt and contribute to the fight, then check the personal modifier rewards. Repeat only while the current reward preview supports your target.'],
  caveats: ['A reward pool is not a guaranteed drop of every listed material.', 'Tier, modifier availability and participation affect rewards. No fixed drop rate or quantity is asserted.'], evidence: [hunts, sheet],
})
const dungeon = (difficulty: 'Advanced' | 'Master'): AcquisitionRoute => ({
  id: `demonweb-${difficulty.toLowerCase()}`, method: 'Dungeon drop', location: `Demonweb Pits (${difficulty})`,
  requirements: ['Campaign and queue access for this difficulty; check current item-level and group requirements in-game.'],
  steps: [`Choose Demonweb Pits on ${difficulty}, not a different difficulty with a different material pool.`, 'Complete the dungeon encounters and inspect earned drops/rewards for the exact material name.', 'Repeat runs as needed only after confirming the current reward pool.'],
  caveats: ['The launch-era reference identifies the difficulty, not a guaranteed boss, chest, quantity or probability.', 'Marilith Hair and Perfect Marilith Hair are distinct resources, not interchangeable aliases.'], evidence: [sheet, video],
})
const sharandarChart = (zone: string): AcquisitionRoute => ({
  id: `sharandar-${slug(zone)}`, method: 'Explorer chart', location: `New Sharandar - ${zone}`,
  requirements: ['Access to the corresponding New Sharandar area.', `The matching Explorer's Chart: Sharandar - ${zone}.`],
  steps: [`Check Stronghold explorer-chart stock for the Sharandar ${zone} case; the 2021 guide uses Guild Marks. Confirm current availability before buying.`, 'Open the case, use the chart and accept its quest.', 'Follow the quest trail to that chart\'s resource nodes in New Sharandar and collect the materials.'],
  caveats: ['Historical module-21 guide, not a live stock check. Chart availability and profession requirements have changed over time.', 'The chart contains a material pool. Current quantities and profession-event bonuses have not been verified.'], evidence: [sharandarMaps],
})
const vaultBoss: AcquisitionRoute = {
  id: 'vault-boss', method: 'Dungeon drop', location: 'Vault of Stars - boss encounters',
  requirements: ['Vault of Stars access and a suitable group. Confirm the material is available in the current difficulty/version.'],
  steps: ['Run Vault of Stars and defeat its bosses.', 'Inspect your personal boss drops for the exact named material.', 'Repeat eligible boss encounters as needed; this reference does not establish a guaranteed drop.'],
  caveats: ['The reviewed source does not reliably assign each material to a named boss or distinguish current difficulty variants.', 'These personal boss drops are different from the Corpse Flower group-roll material.'], evidence: [vault],
}
export const materialSourceRecords: MaterialSourceGuide[] = [
  ...['Fluorescent Flora', 'Mushroom Log'].map((name) => record(name, 'Underdark', chart('Menzoberranzan'))),
  ...['Faerzress Rock', 'Luminescent Darklake Water'].map((name) => record(name, 'Underdark', chart('Narbondellyn'))),
  ...['Druegarsteel Scrap', 'Menzoberranzan Faerzress Crystal', 'Mushroom Droplet'].map((name) => record(name, 'Underdark', hunt('Tricky Reversal'), 'documented')),
  ...['Drider Leg', 'Umber Hulk Mandible', 'Shroomsap Spores'].map((name) => record(name, 'Underdark', hunt('Itty Bitty'), 'documented')),
  record('Fungal Moss', 'Underdark', { ...hunt('Itty Bitty'), evidence: [sheet, video] }, 'historical', ['The launch-era spreadsheet places Fungal Moss in the Itty Bitty group. The reviewed wiki reward table does not independently corroborate it; verify the modifier tooltip before farming.']),
  ...['Marilith Hair', 'Demonweb Faerzress Crystal', 'Goristro Hide'].map((name) => record(name, 'Underdark', dungeon('Advanced'))),
  ...["Fallen God's Ore", 'Perfect Marilith Hair', 'Abyssal Crystal'].map((name) => record(name, 'Underdark', dungeon('Master'))),
  record('Calcified Webbing', 'Underdark', {
    id: 'campaign-webbing', method: 'Campaign store', location: 'Demonweb Pits campaign store',
    requirements: ['Demonweb Pits campaign store access and the currencies shown by the current listing.'],
    steps: ['Open the Demonweb Pits campaign and its store.', 'Locate Calcified Webbing and inspect its unlock, currency and quantity per purchase.', 'Acquire the required campaign currency and purchase the amount needed for your plan.'],
    caveats: ['The source names the store but does not establish a current price, currency quantity or unlock milestone.'], evidence: [sheet, video],
  }),
  ...['Feywood Log', 'Hardened Blight Bark', 'Dryad Hair'].map((name) => record(name, 'Sharandar', sharandarChart('The Grove'))),
  ...["Weeping Willow's Tears", 'Shade Leaves', "Shadowdemon's Eyes"].map((name) => record(name, 'Sharandar', sharandarChart('The Mires'))),
  ...["Trolls' Earwax Resin", 'Silvertongue Moss', 'Soulfire Flies'].map((name) => record(name, 'Sharandar', sharandarChart('The Ruins'))),
  ...["Shard of Dawn's Light", 'Shattered Snowflakes', "Displacer Beast's Whisker"].map((name) => record(name, 'Sharandar', vaultBoss, 'documented')),
  record('Corpse Flower Thorn', 'Sharandar', {
    id: 'corpse-flower', method: 'Dungeon drop', location: 'Vault of Stars - Corpse Flowers',
    requirements: ['Vault of Stars access and a group; check current loot rules.'],
    steps: ['Enter Vault of Stars and defeat Corpse Flower enemies.', 'Check for the Corpse Flower Thorn drop and participate in the group loot roll when offered.', 'Repeat eligible encounters as needed; winning the group roll is not guaranteed.'],
    caveats: ['The reviewed wiki describes this as a group-roll drop, unlike the personal boss materials.', 'No current probability, respawn farm or difficulty-specific guarantee is established.'], evidence: [vault],
  }, 'documented'),
  record('Terebinth', 'Shared', {
    id: 'atelier', method: 'Stronghold vendor', location: 'Stronghold - Atelier',
    requirements: ['Access to a Stronghold with the Atelier vendor available.', 'Guild Marks and any current vendor/profession unlocks.'],
    steps: ['Visit the Atelier vendor at an eligible Stronghold.', 'Find Terebinth in its stock and verify the current Guild Mark price and purchase quantity.', 'Purchase the required amount. If the vendor is unavailable, check with the guild about structure availability.'],
    caveats: ['A 2023 guide reports 400 Guild Marks per unit; this is historical, not a current price guarantee.'], evidence: [vendor, treeResin],
  }),
  { name: 'Questionable Piece of Leather', aliases: [], scope: 'Sharandar', reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status: 'unresolved', routes: [], notes: ['A 2021 player report mentions a New Sharandar drop, but the exact enemy/activity and repeatable acquisition method remain unverified.', 'Do not assume this is a Vault of Stars boss drop or a particular explorer-chart reward. A current item tooltip or documented drop is needed.'], researchLeads: [leatherLead] },
]
const sourceByName = new Map(materialSourceRecords.map((row) => [normalizeMaterialSourceName(row.name), row]))
export function getMaterialSourceGuide(name: string): MaterialSourceGuide {
  return sourceByName.get(normalizeMaterialSourceName(name)) ?? { name, aliases: [], scope: 'Unclassified', reviewedAt: MATERIAL_SOURCES_REVIEWED_AT, status: 'unresolved', routes: [], notes: ['No acquisition route has been verified for this exact material. A missing route is not evidence that the item is unavailable.', 'Check the exact item tooltip or submit an attributable acquisition source before a farming route is added.'] }
}
