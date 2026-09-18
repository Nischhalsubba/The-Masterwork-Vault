export type ResearchStatus = 'publisher-documented' | 'source-documented' | 'historical' | 'unresolved'

export interface MasterworkResearchSource {
  id: string
  label: string
  url: string
  publishedAt: string | null
  status: ResearchStatus
  supports: string
  limitation: string
}

export interface ChultanFormula {
  name: string
  outputQuantity: number
  inputs: { name: string; quantity: number }[]
}

export interface ChultanWeaponSlot {
  slot: string
  inputs: { name: string; quantity: number }[]
}

export const MASTERWORK_RESEARCH_REVIEWED_AT = '2026-09-18'

export const masterworkResearchSources: MasterworkResearchSource[] = [
  {
    id: 'publisher-2021-masterwork-rework',
    label: 'Neverwinter professions / Masterwork rework',
    url: 'https://www.playneverwinter.com/en/news-details/11500323',
    publishedAt: '2021-10-19',
    status: 'publisher-documented',
    supports: 'The 2021 rework renamed Masterwork IV and V to Chultan Masterwork, moved recipe books to direct Stronghold Artisan purchases, and removed the old Artisan storyline as the acquisition path.',
    limitation: 'This publication documents the rework date, not every 2026 vendor restriction, binding rule, price or recipe row.',
  },
  {
    id: 'chultan-weapon-sheet',
    label: 'Chultan Masterwork Weapons worksheet',
    url: 'https://docs.google.com/spreadsheets/d/1gYsenO0JX3fOkZrSxgyJ7fdiBPK_dcs96sP3blUra44/edit',
    publishedAt: null,
    status: 'historical',
    supports: 'A post-rework community worksheet records 18 class weapon-slot formulas plus the intermediate recipe ratios used by those weapon formulas.',
    limitation: 'The sheet has no reliable publication/version marker in its cells and is not a 2026 live-game capture. It is reference evidence, not planner-ready current certification.',
  },
  {
    id: 'chultan-2023-field-guide',
    label: 'New OutRiders Chultan Masterwork field guide',
    url: 'https://newoutriders.org/2023/01/13/temple-of-the-spider-queen-and-masterwork-weapons/',
    publishedAt: '2023-01-13',
    status: 'source-documented',
    supports: 'Documents Level 20, Chultan Masterwork I then II, material families, explorer sources, purchased materials and ToNG drops as used by an active crafter in 2023.',
    limitation: 'Community field guide. Auction prices, guild-mark costs and any statements about needing all seven professions are historical observations, not 2026 guarantees.',
  },
  {
    id: 'menzoberranzan-2023-forum',
    label: 'Menzoberranzan Masterwork feedback',
    url: 'https://forum.arcgames.com/neverwinter/discussion/1267445/menzoberranzan-masterwork-general-feedback',
    publishedAt: '2023-08-01',
    status: 'source-documented',
    supports: 'Direct 2023 player-feedback evidence discusses the released Menzoberranzan weapon and gear recipes and their material requirements.',
    limitation: 'Forum feedback is not a publisher specification, and individual recipe details may have changed after the discussion.',
  },
  {
    id: 'arc-2026-roadmap',
    label: 'Neverwinter 2026 content roadmap',
    url: 'https://www.arcgames.com/news/11580882',
    publishedAt: '2026-04-21',
    status: 'publisher-documented',
    supports: 'Publisher roadmap for Neverwinter content in 2026.',
    limitation: 'No Masterwork tier is announced on this page; absence from one roadmap is not proof that no later tier exists.',
  },
  {
    id: 'arc-2026-biting-cold',
    label: 'Neverwinter: Biting Cold launch',
    url: 'https://www.arcgames.com/news/11581920',
    publishedAt: '2026-05-19',
    status: 'publisher-documented',
    supports: 'Publisher description of Module 33 and its major content.',
    limitation: 'The launch article does not announce a new Masterwork tier. That is evidence of what this release article contains, not proof of global nonexistence.',
  },
  {
    id: 'arc-2026-monoliths',
    label: 'Neverwinter: Monoliths of Madness launch',
    url: 'https://www.arcgames.com/news/11582804',
    publishedAt: '2026-09-01',
    status: 'publisher-documented',
    supports: 'Publisher description of the September 2026 update and its major content.',
    limitation: 'The launch article does not announce a new Masterwork tier. That cannot establish that no unannounced or separately documented tier exists.',
  },
]

export const chultanIntermediateFormulas: ChultanFormula[] = [
  { name: 'Brilliant Bead', outputQuantity: 4, inputs: [{ name: 'Batiri Prism', quantity: 10 }, { name: 'Red Rouge', quantity: 4 }] },
  { name: 'Bronzewood Lumber', outputQuantity: 4, inputs: [{ name: 'Bronzewood Log', quantity: 12 }, { name: 'Tincal', quantity: 1 }] },
  { name: 'Chultan Silk', outputQuantity: 2, inputs: [{ name: 'Chultan Silk Thread', quantity: 4 }, { name: 'Potash', quantity: 1 }, { name: 'Spider Silk', quantity: 4 }] },
  { name: 'Chultan Silk Thread', outputQuantity: 4, inputs: [{ name: 'Silkworm Cocoon', quantity: 12 }, { name: 'Chultan Spring Water', quantity: 6 }] },
  { name: 'Chultan Wootz Ingot', outputQuantity: 4, inputs: [{ name: 'Chultan Wootz', quantity: 5 }, { name: 'Chultan Tea Leaves', quantity: 3 }] },
  { name: 'Fanged Ornament', outputQuantity: 2, inputs: [{ name: 'Brilliant Bead', quantity: 4 }, { name: 'Jute Macrame', quantity: 3 }, { name: 'Allosaur Fang', quantity: 4 }] },
  { name: 'Feathered Ornament', outputQuantity: 2, inputs: [{ name: 'Brilliant Bead', quantity: 4 }, { name: 'Jute Macrame', quantity: 3 }, { name: 'Brilliant Pinion', quantity: 12 }] },
  { name: 'Hardened Bronzewood', outputQuantity: 2, inputs: [{ name: 'Bronzewood Lumber', quantity: 4 }, { name: 'Lakh Varnish', quantity: 1 }] },
  { name: 'Jute Macrame', outputQuantity: 3, inputs: [{ name: 'Samarachan Jute', quantity: 15 }] },
  { name: 'Lacquered Dinosaur Leather', outputQuantity: 2, inputs: [{ name: 'Chultan Tea Leaves', quantity: 12 }, { name: "Tanner's Liquor", quantity: 1 }, { name: 'Lakh Varnish', quantity: 2 }, { name: 'Dinosaur Hide', quantity: 6 }] },
  { name: 'Lakh Varnish', outputQuantity: 3, inputs: [{ name: 'Lakh Resin', quantity: 15 }, { name: 'Terebinth', quantity: 5 }] },
  { name: 'Lion Fur', outputQuantity: 2, inputs: [{ name: 'Lion Hide', quantity: 10 }, { name: "Tanner's Liquor", quantity: 3 }, { name: 'Tincal', quantity: 3 }] },
  { name: 'Living Bronzewood', outputQuantity: 3, inputs: [{ name: 'Bronzewood Lumber', quantity: 4 }, { name: 'Tear of Ubtao', quantity: 1 }] },
  { name: 'Living Varnish', outputQuantity: 3, inputs: [{ name: 'Tear of Ubtao', quantity: 1 }, { name: 'Lakh Varnish', quantity: 3 }] },
  { name: 'Obsidian Shard', outputQuantity: 4, inputs: [{ name: 'Obsidian', quantity: 12 }, { name: 'Red Rouge', quantity: 1 }] },
  { name: 'Soulfired Obsidian', outputQuantity: 3, inputs: [{ name: 'Obsidian Shard', quantity: 4 }, { name: 'Mote of Soulfire', quantity: 1 }] },
]

export const chultanWeaponSlots: ChultanWeaponSlot[] = [
  { slot: 'Cleric main-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Jute Macrame',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Obsidian Shard',quantity:1},{name:'Lakh Varnish',quantity:1}] },
  { slot: 'Cleric off-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Fanged Ornament',quantity:2},{name:'Lakh Varnish',quantity:1}] },
  { slot: 'Rogue main-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Obsidian Shard',quantity:4},{name:'Lacquered Dinosaur Leather',quantity:2},{name:'Hardened Bronzewood',quantity:1},{name:'Feathered Ornament',quantity:1}] },
  { slot: 'Rogue off-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Chultan Wootz Ingot',quantity:3}] },
  { slot: 'Fighter main-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Lacquered Dinosaur Leather',quantity:2},{name:'Chultan Wootz Ingot',quantity:3}] },
  { slot: 'Fighter off-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Obsidian Shard',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Lion Fur',quantity:1}] },
  { slot: 'Paladin main-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Lacquered Dinosaur Leather',quantity:2},{name:'Chultan Wootz Ingot',quantity:3},{name:'Chultan Silk',quantity:1}] },
  { slot: 'Paladin off-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Lion Fur',quantity:2},{name:'Lacquered Dinosaur Leather',quantity:1}] },
  { slot: 'Barbarian main-hand', inputs: [{name:'Chultan Wootz Ingot',quantity:3},{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Lacquered Dinosaur Leather',quantity:2}] },
  { slot: 'Barbarian off-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Brilliant Bead',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Chultan Silk Thread',quantity:1}] },
  { slot: 'Ranger main-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Feathered Ornament',quantity:2},{name:'Obsidian Shard',quantity:2},{name:'Chultan Silk Thread',quantity:2},{name:'Lakh Varnish',quantity:1}] },
  { slot: 'Ranger off-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Lion Fur',quantity:2},{name:'Bronzewood Lumber',quantity:1}] },
  { slot: 'Wizard main-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Jute Macrame',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Obsidian Shard',quantity:1},{name:'Lakh Varnish',quantity:1}] },
  { slot: 'Wizard off-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Brilliant Bead',quantity:4},{name:'Fanged Ornament',quantity:2},{name:'Chultan Silk Thread',quantity:1}] },
  { slot: 'Warlock main-hand', inputs: [{name:'Living Bronzewood',quantity:3},{name:'Obsidian Shard',quantity:4},{name:'Feathered Ornament',quantity:2},{name:'Jute Macrame',quantity:1},{name:'Lakh Varnish',quantity:1}] },
  { slot: 'Warlock off-hand', inputs: [{name:'Living Varnish',quantity:3},{name:'Lacquered Dinosaur Leather',quantity:4},{name:'Chultan Silk Thread',quantity:5}] },
  { slot: 'Bard main-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Obsidian Shard',quantity:4},{name:'Lacquered Dinosaur Leather',quantity:2},{name:'Hardened Bronzewood',quantity:1},{name:'Feathered Ornament',quantity:1}] },
  { slot: 'Bard off-hand', inputs: [{name:'Soulfired Obsidian',quantity:3},{name:'Hardened Bronzewood',quantity:4},{name:'Fanged Ornament',quantity:2},{name:'Lakh Varnish',quantity:1}] },
]

export const masterworkTierAssessment = {
  latestPositivelyDocumented: 'Menzoberranzan',
  evidenceDate: '2023-08',
  laterTierStatus: 'unresolved' as const,
  reviewedThrough: MASTERWORK_RESEARCH_REVIEWED_AT,
  note: 'Menzoberranzan is the latest tier positively documented in the reviewed source set. No later tier was verified in the reviewed 2026 roadmap, Biting Cold launch, Monoliths of Madness launch, or targeted Masterwork searches. This is not proof that no later tier exists; verify any newer in-game book or vendor before treating the path as final.',
}

export const masterworkResearchLimits = [
  'The current complete Chultan I / II final-output inventory is not established by a sufficiently current, attributable public source.',
  'The 18 Chultan weapon-slot formulas and 16 intermediate recipes below come from a community worksheet and are kept out of planner math until they are independently reverified in-game.',
  'Current Stronghold rank gates, book binding and minimum one-profession versus all-seven prerequisites remain source-dependent and are not converted into hard eligibility rules.',
  'A 2021 publisher rework changed Masterwork acquisition and recipes, so pre-rework Masterwork IV / V tables are historical references rather than current Chultan truth.',
] as const
