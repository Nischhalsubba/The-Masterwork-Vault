export type ResearchCorrectionStatus = 'publisher-correction' | 'coverage-gap' | 'source-conflict' | 'model-correction'

export interface ResearchCorrection {
  id: string
  title: string
  status: ResearchCorrectionStatus
  summary: string
  impact: string
  sourceUrl: string
  sourceLabel: string
  publishedAt: string
  reviewedAt: string
}

export const RESEARCH_CORRECTIONS_REVIEWED_AT = '2026-09-18'

export const APRIL_2023_MASTERWORK_PATCH = 'https://www.playneverwinter.com/en/news-details/11542223'
export const OCTOBER_2021_MASTERWORK_PATCH = 'https://www.playneverwinter.com/en/news-details/11500323'
export const JULY_2021_PROFESSIONS_UPDATE = 'https://www.playneverwinter.com/en/news-details/11491453'

export const publisherSharandarItemCorrections = [
  { name: 'Thorned Amulet +1', slot: 'Neck', itemLevel: 1300, previousItemLevel: 1200 },
  { name: 'Feywood Amulet +1', slot: 'Neck', itemLevel: 1300, previousItemLevel: 1200 },
  { name: 'Thorned Sash +1', slot: 'Waist', itemLevel: 1300, previousItemLevel: 1200 },
  { name: 'Feywood Sash +1', slot: 'Waist', itemLevel: 1300, previousItemLevel: 1200 },
  { name: "Dawn's Light Sash +1", slot: 'Waist', itemLevel: 1300, previousItemLevel: 1200 },
] as const

export const masterworkResearchCorrections: ResearchCorrection[] = [
  {
    id: 'hermits-incense-plus-one-item-level',
    title: "Hermit's Incense +1",
    status: 'publisher-correction',
    summary: 'Publisher patch notes increased the +1 variant from Item Level 90 to Item Level 95.',
    impact: 'The catalog should keep the screenshot-backed recipe and proficiency stats, while the +1 item level follows the newer publisher correction.',
    sourceUrl: APRIL_2023_MASTERWORK_PATCH,
    sourceLabel: 'Neverwinter Patch Notes for 4/20/23',
    publishedAt: '2023-04-19',
    reviewedAt: RESEARCH_CORRECTIONS_REVIEWED_AT,
  },
  {
    id: 'sharandar-plus-one-accessories',
    title: 'Sharandar +1 accessory coverage',
    status: 'coverage-gap',
    summary: "The same publisher patch names Thorned Amulet +1, Feywood Amulet +1, Thorned Sash +1, Feywood Sash +1, and Dawn's Light Sash +1, raising each from Item Level 1200 to 1300.",
    impact: 'These items should be represented in the catalog as publisher-confirmed records even while recipe, stats, bind, and authentic artwork remain uncaptured.',
    sourceUrl: APRIL_2023_MASTERWORK_PATCH,
    sourceLabel: 'Neverwinter Patch Notes for 4/20/23',
    publishedAt: '2023-04-19',
    reviewedAt: RESEARCH_CORRECTIONS_REVIEWED_AT,
  },
  {
    id: 'lichstone-recipe-rework',
    title: 'Lichstone recipe rework',
    status: 'source-conflict',
    summary: "The 2021 publisher rework says the Lichstone recipe requires 3 Lichstones and no longer requires Artisan's Enamels.",
    impact: 'Older profession task-table evidence using Artisan\'s Enamel is historical lineage evidence only and must not be treated as the post-rework live recipe.',
    sourceUrl: OCTOBER_2021_MASTERWORK_PATCH,
    sourceLabel: 'October 2021 Masterwork rework',
    publishedAt: '2021-10-18',
    reviewedAt: RESEARCH_CORRECTIONS_REVIEWED_AT,
  },
  {
    id: 'brilliant-beads-rework',
    title: 'Brilliant Beads recipe rework',
    status: 'source-conflict',
    summary: 'The 2021 publisher rework explicitly requires 4 Red Rouge and removes Scintillant Glass from Brilliant Beads.',
    impact: 'Community Chultan formulas need chronology/name reconciliation before they are promoted into current planner data.',
    sourceUrl: OCTOBER_2021_MASTERWORK_PATCH,
    sourceLabel: 'October 2021 Masterwork rework',
    publishedAt: '2021-10-18',
    reviewedAt: RESEARCH_CORRECTIONS_REVIEWED_AT,
  },
  {
    id: 'gathering-level-compression',
    title: 'Gathering source uses the old profession scale',
    status: 'model-correction',
    summary: 'The publisher compressed profession levels 1–80 into 20 four-level buckets in 2021.',
    impact: 'The first 25 rows of the legacy Gathering table cannot be called a complete modern Level 1–20 route. They remain a legacy sample until the full table is reconciled.',
    sourceUrl: JULY_2021_PROFESSIONS_UPDATE,
    sourceLabel: 'Developer Blog: Professions Updates',
    publishedAt: '2021-07-16',
    reviewedAt: RESEARCH_CORRECTIONS_REVIEWED_AT,
  },
]
