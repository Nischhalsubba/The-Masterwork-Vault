import catalog from './catalog'

export type KnowledgeConfidence =
  | 'screenshot-backed'
  | 'spreadsheet-supplemental'
  | 'historical-secondary'
  | 'unknown'

export type MasterworkCampaign = 'Chultan MW1' | 'Chultan MW2' | 'Sharandar MW' | 'Menzoberranzan MW'

export const knowledgeSourcePriority = [
  'Latest user-supplied correction screenshots',
  'User-supplied final screenshot archives (Sharandar.zip / Underdark Masterwork.zip)',
  'Screenshot-derived extraction data',
  'Menzoberranzan MW spreadsheet/extraction',
  'User-shared workshop/progression transcript-equivalent and links',
  'External/community guidance only when explicitly labeled historical/secondary',
] as const

export const knowledgeSources = [
  {
    id: 'underdark-final-screenshots',
    type: 'user-supplied-archive',
    label: 'Underdark Masterwork.zip',
    confidence: 'screenshot-backed' as const,
  },
  {
    id: 'sharandar-final-screenshots',
    type: 'user-supplied-archive',
    label: 'Sharandar.zip',
    confidence: 'screenshot-backed' as const,
  },
  {
    id: 'menzoberranzan-spreadsheet',
    type: 'user-shared-google-sheet',
    label: 'Spreadsheet - Menzoberranzan MW',
    url: 'https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit?gid=820810729#gid=820810729',
    confidence: 'spreadsheet-supplemental' as const,
  },
  {
    id: 'workshop-rank-guide',
    type: 'user-shared-transcript-equivalent',
    label: 'Comprehensive Text Guide and Economic Analysis: Upgrading the Neverwinter Workshop (Rank 1 to Rank 4)',
    note: 'Historical Module 15 progression knowledge reconstructed from Gavscar Gaming video timestamps plus community documentation. It is not a literal transcript and must not be presented as a current 2026 hard gate without current in-game verification.',
    confidence: 'historical-secondary' as const,
  },
] as const

export const workshopProgressionKnowledge = {
  confidence: 'historical-secondary' as KnowledgeConfidence,
  currentVerificationRequired: true,
  ranks: [
    {
      fromRank: 1,
      toRank: 2,
      requirements: [
        {
          type: 'profession-level',
          minimumLevel: 15,
          count: 1,
          description: 'The supplied progression guide states that at least one profession must reach Level 15 to advance the early workshop questline.',
        },
      ],
      source: 'User-shared workshop progression guide, Phase 2',
    },
    {
      fromRank: 2,
      toRank: 3,
      requirements: [
        {
          type: 'south-sea-trading-company-credits',
          amount: 500_000,
          description: 'The supplied guide records 500,000 South Sea Trading Company Credits for the Rank 3 upgrade.',
        },
      ],
      strategy: [
        'Commission items rotate on a daily schedule.',
        'The supplied guide highlights Beeswax as an efficient historical route and records Alchemy Level 44 for Beeswax.',
      ],
      source: 'User-shared workshop progression guide, Phase 3',
    },
    {
      fromRank: 3,
      toRank: 4,
      requirements: [
        {
          type: 'profession-level',
          minimumLevel: 20,
          count: 1,
          description: 'The supplied guide states that at least one profession must be Level 20 before the Grand Upgrade can advance.',
        },
        {
          type: 'south-sea-trading-company-credits',
          amountCandidates: [2_500_000, 5_000_000],
          description: 'The guide records a historical reduction from 5,000,000 to 2,500,000 credits and warns that some quest text remained stale.',
        },
      ],
      source: 'User-shared workshop progression guide, Phase 4',
    },
  ],
  masterworkGate: {
    requiredWorkshopRank: 4,
    description: 'The supplied historical guide treats Workshop Rank 4 as the prerequisite for entering Masterwork professions.',
    currentVerificationRequired: true,
  },
} as const

export const historicalCommissionIndex = [
  ['Sleeping Phial', 26, 6],
  ['Steel Greataxe', 29, 300],
  ['Wolfskin Jacket', 32, 300],
  ['Amethyst Ring', 33, 150],
  ['Silver Symbol', 36, 600],
  ['Honey', 41, 150],
  ['Beeswax', 44, 225],
  ['Black Pearl Ring', 46, 450],
  ['Mithral Greataxe', 50, 1_200],
  ['Mithral Symbol', 50, 1_200],
  ['Electrum Symbol', 60, 1_800],
  ['Blackiron Greataxe', 62, 1_800],
  ['Adamantine Claymore', 70, 3_000],
  ['Gold Symbol', 70, 3_000],
  ['Adamantine Cuirass', 70, 3_000],
  ['Black Ink', 70, 750],
].map(([item, requiredProfessionLevel, baseCreditYield]) => ({
  item: String(item),
  requiredProfessionLevel: Number(requiredProfessionLevel),
  baseCreditYield: Number(baseCreditYield),
  confidence: 'historical-secondary' as const,
  currentVerificationRequired: true,
}))

const unlockRows = [
  'Alchemy',
  'Artificing',
  'Jewelcrafting',
  'Leatherworking',
  'Armorsmithing',
  'Tailoring',
  'Blacksmithing',
] as const

export const masterworkUnlockPrices = Object.fromEntries(
  unlockRows.map((profession) => [
    profession,
    {
      profession,
      chultanMW1: 500_000,
      chultanMW2: 500_000,
      sharandarMW: 1_500_000,
      menzoberranzanMW: 1_500_000,
      confidence: 'spreadsheet-supplemental' as const,
      currentVerificationRequired: true,
      source: 'Spreadsheet - Menzoberranzan MW, profession unlock-price table',
    },
  ]),
) as Record<string, {
  profession: string
  chultanMW1: number
  chultanMW2: number
  sharandarMW: number
  menzoberranzanMW: number
  confidence: 'spreadsheet-supplemental'
  currentVerificationRequired: boolean
  source: string
}>

const normalized = (value: string) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const itemByName = new Map<string, any>((catalog.items ?? []).map((item: any) => [normalized(item.name), item]))
const materialByName = new Map<string, any>((catalog.materials ?? []).map((material: any) => [normalized(material.name), material]))
const recipeByName = new Map<string, any>((catalog.recipes ?? []).map((recipe: any) => [normalized(recipe.name), recipe]))

const unlockFor = (profession?: string | null, campaign?: string | null) => {
  if (!profession) return null
  const row = masterworkUnlockPrices[profession]
  if (!row) return null
  const era = String(campaign ?? '').toLowerCase()
  if (era.includes('sharandar')) return { amount: row.sharandarMW, campaign: 'Sharandar MW' as const, ...row }
  if (era.includes('under') || era.includes('menzo')) return { amount: row.menzoberranzanMW, campaign: 'Menzoberranzan MW' as const, ...row }
  return null
}

const directNeeds = (entity: any, recipe: any) => {
  if (Array.isArray(entity?.materials) && entity.materials.length) return entity.materials
  if (Array.isArray(recipe?.materials) && recipe.materials.length) return recipe.materials
  return []
}

const expandDependencies = (name: string, seen = new Set<string>()): any[] => {
  const key = normalized(name)
  if (seen.has(key)) return []
  seen.add(key)
  const recipe = recipeByName.get(key)
  if (!recipe?.materials?.length) return []
  return recipe.materials.map((need: any) => {
    const childRecipe = recipeByName.get(normalized(need.name))
    return {
      name: need.name,
      required: need.required ?? need.quantity ?? 0,
      craftable: Boolean(childRecipe?.materials?.length),
      profession: childRecipe?.profession ?? materialByName.get(normalized(need.name))?.profession ?? null,
      children: expandDependencies(need.name, new Set(seen)),
    }
  })
}

export const getCraftingRequirementProfile = (name: string) => {
  const key = normalized(name)
  const entity = itemByName.get(key) ?? materialByName.get(key) ?? null
  const recipe = recipeByName.get(key) ?? null
  if (!entity && !recipe) return null

  const profession = entity?.profession ?? recipe?.profession ?? null
  const campaign = entity?.campaign ?? recipe?.campaign ?? null
  const professionLevel = entity?.professionLevel ?? entity?.level ?? recipe?.professionLevel ?? null

  return {
    name: entity?.name ?? recipe?.name ?? name,
    kind: itemByName.has(key) ? 'item' : 'material',
    campaign,
    profession,
    requiredProfessionLevel: professionLevel,
    masterworkUnlock: unlockFor(profession, campaign),
    workshopProgression: workshopProgressionKnowledge,
    directRecipe: directNeeds(entity, recipe),
    dependencyTree: expandDependencies(name),
    provenance: entity?.provenance ?? {
      evidence: recipe?.evidence ?? [],
      sourceStatus: entity?.sourceStatus ?? recipe?.sourceStatus ?? null,
    },
    readinessRule: 'A null requirement means unknown, never zero. Historical progression gates require current verification before being treated as a current hard block.',
  }
}

export const craftingKnowledgePool = {
  schemaVersion: 1,
  sourcePriority: knowledgeSourcePriority,
  sources: knowledgeSources,
  workshopProgression: workshopProgressionKnowledge,
  historicalCommissionIndex,
  masterworkUnlockPrices,
  catalog,
  getRequirementProfile: getCraftingRequirementProfile,
} as const

export default craftingKnowledgePool
