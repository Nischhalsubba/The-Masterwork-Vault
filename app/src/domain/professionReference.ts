/** Community reference data never supplies planner-ready recipe identities. */
export const REFERENCE_PROFESSIONS = ['Alchemy', 'Armorsmithing', 'Artificing', 'Blacksmithing', 'Jewelcrafting', 'Leatherworking', 'Tailoring'] as const
export type ReferenceProfession = typeof REFERENCE_PROFESSIONS[number]
export interface ReferenceIngredient { materialId: string; name: string; quantity: number | null }
export interface ReferenceMaterial { id: string; name: string; gatherable: boolean; gatheringLevel: number | null }
export interface ProfessionRecipeReference {
  id: string; name: string; profession: ReferenceProfession; level: number | null
  category: string; categoryConflict: boolean; outputQuantity: null; inputs: ReferenceIngredient[]
  morale: number | null; xp: number | null; proficiency: number | null
  focusMinimum: number | null; focusGoal: number | null
}
export interface ProfessionReferenceSnapshot {
  schemaVersion: 1; reviewedAt: string; sourcePublishedAt: string; sourceUrl: string
  sourceAnnouncementUrl: string; sourceName: string; confidence: 'community-snapshot'; plannerEligible: false
  professionCounts: Record<ReferenceProfession, number>; materials: ReferenceMaterial[]; recipes: ProfessionRecipeReference[]
}
const idPattern = /^[a-f0-9]{32}$/
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const named = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const optionalNumber = (value: unknown) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0)
const optionalLevel = (value: unknown) => value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 20)
const identified = (row: Record<string, unknown>) => typeof row.id === 'string' && idPattern.test(row.id) && named(row.name)
const fail = (): never => { throw new Error('The profession reference file could not be verified. Reload the reference or use the original source.') }

/** Validate at the loading boundary; never fill missing values with guessed yields. */
export function parseProfessionReference(value: unknown): ProfessionReferenceSnapshot {
  if (!object(value) || value.schemaVersion !== 1 || value.plannerEligible !== false || value.confidence !== 'community-snapshot') return fail()
  for (const field of ['reviewedAt', 'sourcePublishedAt']) if (typeof value[field] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value[field])) return fail()
  if (value.sourceUrl !== 'https://neverwinterdata.notion.site/fc4c4cfb802742ffb99a4f51c330a143' || value.sourceAnnouncementUrl !== 'https://www.reddit.com/r/Neverwinter/comments/1c6a4i7/masterwork_crafting_material_list/' || !named(value.sourceName)) return fail()
  if (!Array.isArray(value.materials) || !Array.isArray(value.recipes) || !object(value.professionCounts)) return fail()
  const materials = new Map<string, string>()
  for (const row of value.materials) {
    if (!object(row) || !identified(row) || typeof row.gatherable !== 'boolean' || !optionalLevel(row.gatheringLevel)) return fail()
    const id = row.id as string
    if (materials.has(id)) return fail()
    materials.set(id, row.name as string)
  }
  const ids = new Set<string>()
  const counts = new Map<string, number>()
  for (const row of value.recipes) {
    if (!object(row) || !identified(row) || !REFERENCE_PROFESSIONS.includes(row.profession as ReferenceProfession) || !optionalLevel(row.level) || typeof row.category !== 'string' || typeof row.categoryConflict !== 'boolean' || row.outputQuantity !== null || !Array.isArray(row.inputs)) return fail()
    if (ids.has(row.id as string)) return fail()
    ids.add(row.id as string)
    counts.set(row.profession as string, (counts.get(row.profession as string) ?? 0) + 1)
    for (const field of ['morale', 'xp', 'proficiency', 'focusMinimum', 'focusGoal']) if (!optionalNumber(row[field])) return fail()
    for (const input of row.inputs) {
      if (!object(input) || typeof input.materialId !== 'string' || materials.get(input.materialId) !== input.name || !optionalNumber(input.quantity)) return fail()
    }
  }
  const expectedCounts = value.professionCounts
  if (!ids.size || counts.size !== REFERENCE_PROFESSIONS.length || REFERENCE_PROFESSIONS.some(name => expectedCounts[name] !== counts.get(name))) return fail()
  return value as unknown as ProfessionReferenceSnapshot
}

export interface ProfessionReferenceFilters { query: string; profession: string; level: string }
const searchText = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[\u2018\u2019]/g, "'")
export function filterProfessionRecipes(rows: readonly ProfessionRecipeReference[], filters: ProfessionReferenceFilters): ProfessionRecipeReference[] {
  const words = searchText(filters.query).trim().split(/\s+/).filter(Boolean)
  return rows.filter(row => {
    if (filters.profession !== 'All' && row.profession !== filters.profession) return false
    if (filters.level === 'unknown' ? row.level !== null : filters.level !== 'All' && row.level !== Number(filters.level)) return false
    const haystack = searchText([row.name, row.profession, ...row.inputs.map(input => input.name)].join(' '))
    return words.every(word => haystack.includes(word))
  })
}
export const professionReferenceHref = (id: string) => idPattern.test(id) ? `https://neverwinterdata.notion.site/${id}` : 'https://neverwinterdata.notion.site/fc4c4cfb802742ffb99a4f51c330a143'
