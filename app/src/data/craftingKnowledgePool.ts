import catalog from './catalog'

export type KnowledgeConfidence =
  | 'screenshot-backed'
  | 'verified-current'
  | 'strong-current'
  | 'spreadsheet-supplemental'
  | 'historical-secondary'
  | 'unknown'

export type MasterworkCampaign = 'Chultan MW1' | 'Chultan MW2' | 'Sharandar MW' | 'Menzoberranzan MW'

export const knowledgeSourcePriority = [
  'Latest user-supplied correction screenshots',
  'Current in-game screenshots / tooltips',
  'Official Neverwinter patch notes and current official documentation',
  'User-supplied final screenshot archives (Sharandar.zip / Underdark Masterwork.zip)',
  'Screenshot-derived extraction data',
  'Menzoberranzan MW spreadsheet/extraction',
  'Current community evidence when official material is silent',
  'Historical/community guidance only when explicitly labeled historical',
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
    id: 'profession-rework-2021',
    type: 'official-patch-note',
    label: 'October 19, 2021 professions / Masterwork rework',
    note: 'Masterwork recipe books became direct purchases from the Stronghold Artisan and the old Stronghold Artisan storyline ceased to be the acquisition prerequisite.',
    confidence: 'verified-current' as const,
  },
  {
    id: 'progression-research-2026',
    type: 'cross-source-research',
    label: '2026 current-system progression research pass',
    note: 'Modern profession, Workshop and Masterwork rules reconciled against official patch notes, current wiki data and live-era community evidence. Unresolved fields remain null rather than inferred.',
    confidence: 'strong-current' as const,
  },
] as const

export const professionMechanics = {
  maxLevel: 20,
  dailyMorale: 400,
  moraleRefillAdPerPoint: 120,
  trainingManualXpMultipliers: {
    tinkers: 0.5,
    makers: 1,
    philosophers: 2,
  },
  doubleProfessionsEvent: {
    xpMultiplier: 1,
    moraleCostMultiplier: 0.5,
    note: 'Modern 2x Professions halves Morale cost rather than doubling XP per successful task.',
  },
  highQualityChance: {
    formula: 'clamp((focus - minimumFocus) / (focusGoal - minimumFocus), 0, 1)',
    confidence: 'strong-current' as KnowledgeConfidence,
  },
  craftingTime: {
    formula: 'baseInterval / (1 + speedModifier / 100)',
    confidence: 'strong-current' as KnowledgeConfidence,
  },
  xpThresholds: null,
  xpThresholdsIgnoredForImplementation: true,
  xpThresholdNote: 'Exact post-2021 profession Level 1→20 XP thresholds remain unavailable from reliable public sources. Time-to-level calculations must remain disabled rather than reuse obsolete Forgotten Profession XP values.',
} as const

export const workshopProgressionKnowledge = {
  confidence: 'strong-current' as KnowledgeConfidence,
  currentVerificationRequired: false,
  note: 'Workshop Rank 4 remains useful Workshop progression but is not a modern prerequisite for purchasing Masterwork recipe books.',
  artisanCapacityByRank: {
    1: 11,
    2: 17,
    3: 23,
    4: 29,
  },
  questTriggers: [
    { professionLevel: 5, quest: 'A Clean Start', outcome: 'Workshop Rank 2 progression' },
    { professionLevel: 8, quest: 'Trading Company', outcome: 'Continue Workshop progression' },
    { professionLevel: 10, quest: 'Lessons Learned', outcome: 'Continue Workshop progression' },
    { professionLevel: 13, quest: 'A Box for Knox', outcome: 'Continue Workshop progression' },
    { professionLevel: 15, quest: 'Facilities Upgrade', outcome: 'Workshop Rank 3 progression' },
  ],
  rank4: {
    quest: 'Grand Upgrade',
    southSeaTradingCompanyCredits: 2_500_000,
    note: 'The South Sea Trading Company credit requirement was reduced from the historical 5,000,000 value to 2,500,000.',
  },
  masterworkGate: {
    requiredWorkshopRank: null,
    supersededHistoricalRule: 4,
    description: 'Workshop Rank 4 was a historical Masterwork-access gate. The 2021 professions rework removed the old Stronghold Artisan storyline requirement and moved books to direct purchase.',
    currentVerificationRequired: false,
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
      confidence: 'strong-current' as const,
      currentVerificationRequired: false,
      source: 'Current-system research plus supplied Menzoberranzan unlock-price data',
    },
  ]),
) as Record<string, {
  profession: string
  chultanMW1: number
  chultanMW2: number
  sharandarMW: number
  menzoberranzanMW: number
  confidence: 'strong-current'
  currentVerificationRequired: boolean
  source: string
}>

export const masterworkProgression = {
  chultan: {
    order: ['Chultan MW1', 'Chultan MW2'] as MasterworkCampaign[],
    purchaseBinding: null,
    purchaseBindingIgnoredForImplementation: true,
    strongholdPurchaseGate: null,
    strongholdPurchaseGateIgnoredForImplementation: true,
    note: 'The exact modern Chultan Choice Pack binding and Stronghold structure/rank lock remain intentionally unspecified. They do not block the current implementation.',
  },
  sharandar: {
    professionLevel: 20,
    prerequisites: ['Chultan MW1', 'Chultan MW2'] as MasterworkCampaign[],
    allChultanRecipesRequired: true,
    vendor: 'Stryker Bronzepin',
    location: 'New Sharandar',
    pricePerProfession: 1_500_000,
    bind: 'Character',
    confidence: 'strong-current' as KnowledgeConfidence,
  },
  menzoberranzan: {
    professionLevel: 20,
    allProfessionsLevel20: true,
    prerequisites: ['Chultan MW1', 'Chultan MW2', 'Sharandar MW'] as MasterworkCampaign[],
    quest: 'Drow Mastery',
    vendor: 'Drow Master Artisan',
    location: 'Narbondellyn',
    pricePerProfession: 1_500_000,
    bind: 'Character',
    confidence: 'strong-current' as KnowledgeConfidence,
  },
} as const

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

export const getMasterworkAccessPath = (campaign?: string | null) => {
  const era = String(campaign ?? '').toLowerCase()
  if (era.includes('sharandar')) {
    return {
      target: 'Sharandar MW' as const,
      steps: ['Obtain Chultan MW1', 'Obtain Chultan MW2', 'Reach profession Level 20', 'Purchase the profession Sharandar book from Stryker Bronzepin'],
      unresolvedIgnoredFields: ['Current Chultan Choice Pack binding', 'Exact modern Stronghold purchase gate'],
    }
  }
  if (era.includes('under') || era.includes('menzo')) {
    return {
      target: 'Menzoberranzan MW' as const,
      steps: ['Reach Level 20 in all seven professions', 'Own all Chultan Masterwork recipes', 'Own all Sharandar Masterwork books', 'Complete Drow Mastery', 'Purchase the profession book from the Drow Master Artisan in Narbondellyn'],
      unresolvedIgnoredFields: ['Current Chultan Choice Pack binding', 'Exact modern Stronghold purchase gate'],
    }
  }
  return null
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
    masterworkAccessPath: getMasterworkAccessPath(campaign),
    workshopProgression: workshopProgressionKnowledge,
    professionMechanics,
    directRecipe: directNeeds(entity, recipe),
    dependencyTree: expandDependencies(name),
    provenance: entity?.provenance ?? {
      evidence: recipe?.evidence ?? [],
      sourceStatus: entity?.sourceStatus ?? recipe?.sourceStatus ?? null,
    },
    readinessRule: 'Unknown requirements stay null. The three user-approved ignored gaps must never be converted to zero, false or a guessed requirement.',
  }
}

export const craftingKnowledgePool = {
  schemaVersion: 2,
  sourcePriority: knowledgeSourcePriority,
  sources: knowledgeSources,
  professionMechanics,
  workshopProgression: workshopProgressionKnowledge,
  masterworkProgression,
  historicalCommissionIndex,
  masterworkUnlockPrices,
  catalog,
  getRequirementProfile: getCraftingRequirementProfile,
  getMasterworkAccessPath,
} as const

export default craftingKnowledgePool
