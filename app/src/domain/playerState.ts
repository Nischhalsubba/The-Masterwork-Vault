export const PLAYER_STATE_KEY = 'masterwork-vault.player-state.v3'
export const PLAYER_STATE_SCHEMA = 3

export const MASTERWORK_PROFESSIONS = [
  'Alchemy',
  'Artificing',
  'Jewelcrafting',
  'Leatherworking',
  'Armorsmithing',
  'Tailoring',
  'Blacksmithing',
] as const

export type MasterworkProfession = typeof MASTERWORK_PROFESSIONS[number]
export type DensityPreference = 'comfortable' | 'compact'

export interface ProfessionProgress {
  level: number
  chultan1: boolean
  chultan2: boolean
  sharandar: boolean
  menzoberranzan: boolean
}

export interface PlayerState {
  schemaVersion: 3
  workshopRank: 1 | 2 | 3 | 4
  professions: Record<MasterworkProfession, ProfessionProgress>
  density: DensityPreference
  legacyJourneyMilestones: string[]
  updatedAt: string
}

const freshProfession = (): ProfessionProgress => ({
  level: 0,
  chultan1: false,
  chultan2: false,
  sharandar: false,
  menzoberranzan: false,
})

export function createDefaultPlayerState(): PlayerState {
  return {
    schemaVersion: PLAYER_STATE_SCHEMA,
    workshopRank: 1,
    professions: Object.fromEntries(MASTERWORK_PROFESSIONS.map((name) => [name, freshProfession()])) as PlayerState['professions'],
    density: 'comfortable',
    legacyJourneyMilestones: [],
    updatedAt: new Date().toISOString(),
  }
}

const clampLevel = (value: unknown) => Math.max(0, Math.min(20, Math.floor(Number(value) || 0)))
const bool = (value: unknown) => value === true

function normalizeProfession(value: unknown): ProfessionProgress {
  const row = value && typeof value === 'object' ? value as Partial<ProfessionProgress> : {}
  const level = clampLevel(row.level)
  const chultan1 = bool(row.chultan1)
  const chultan2 = chultan1 && bool(row.chultan2)
  const sharandar = chultan2 && level >= 20 && bool(row.sharandar)
  const menzoberranzan = sharandar && bool(row.menzoberranzan)
  return { level, chultan1, chultan2, sharandar, menzoberranzan }
}

export function normalizePlayerState(value: unknown): PlayerState {
  const fallback = createDefaultPlayerState()
  if (!value || typeof value !== 'object') return fallback
  const raw = value as Record<string, unknown>
  const rawProfessions = raw.professions && typeof raw.professions === 'object'
    ? raw.professions as Record<string, unknown>
    : {}

  const rank = Math.max(1, Math.min(4, Math.floor(Number(raw.workshopRank) || 1))) as PlayerState['workshopRank']
  const density = raw.density === 'compact' ? 'compact' : 'comfortable'
  const legacy = Array.isArray(raw.legacyJourneyMilestones)
    ? raw.legacyJourneyMilestones.filter((entry): entry is string => typeof entry === 'string').slice(0, 50)
    : []

  return {
    schemaVersion: PLAYER_STATE_SCHEMA,
    workshopRank: rank,
    professions: Object.fromEntries(MASTERWORK_PROFESSIONS.map((name) => [name, normalizeProfession(rawProfessions[name])])) as PlayerState['professions'],
    density,
    legacyJourneyMilestones: legacy,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  }
}

function readLegacyJourney(): string[] {
  try {
    const raw = window.localStorage.getItem('masterwork-vault.workshop-journey.v2')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function loadPlayerState(): PlayerState {
  try {
    const raw = window.localStorage.getItem(PLAYER_STATE_KEY)
    if (raw) return normalizePlayerState(JSON.parse(raw))
  } catch {
    // Fall through to a safe fresh state.
  }
  const state = createDefaultPlayerState()
  state.legacyJourneyMilestones = readLegacyJourney()
  return state
}

export function savePlayerState(state: PlayerState): PlayerState {
  const clean = normalizePlayerState({ ...state, updatedAt: new Date().toISOString() })
  try {
    window.localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(clean))
    document.documentElement.dataset.density = clean.density
    document.dispatchEvent(new CustomEvent('masterwork:player-state', { detail: clean }))
  } catch {
    // Storage is progressive enhancement; the UI remains usable without it.
  }
  return clean
}

export function serializePlayerState(state: PlayerState) {
  return JSON.stringify({
    type: 'masterwork-vault-player-state',
    exportedAt: new Date().toISOString(),
    payload: normalizePlayerState(state),
  }, null, 2)
}

export function parsePlayerStateExport(text: string): PlayerState {
  const parsed = JSON.parse(text) as unknown
  if (!parsed || typeof parsed !== 'object') throw new Error('The selected file does not contain a Masterwork Vault player state.')
  const envelope = parsed as Record<string, unknown>
  if (envelope.type !== 'masterwork-vault-player-state') throw new Error('This JSON file is not a Masterwork Vault player-state export.')
  return normalizePlayerState(envelope.payload)
}
