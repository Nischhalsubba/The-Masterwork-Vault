export type SourceStatus = 'final-zip' | 'latest-user-screenshot' | 'spreadsheet-supplemental' | string

export interface MaterialNeed {
  name: string
  required: number
}

export interface ItemVariant {
  quality?: string
  name?: string
  itemLevel?: number
  stats?: Record<string, number | string>
  source?: string
  levelLabel?: string
}

export interface ItemEntry {
  id: string
  name: string
  kind: string
  classes: string[]
  slot?: string | null
  categories: string[]
  profession?: string | null
  icon?: string | null
  iconIndex?: number | null
  bind?: string | null
  levelRequirement?: number | null
  variants: ItemVariant[]
  itemLevel?: number | null
  stats?: Record<string, number | string> | null
  equipPower?: { name?: string; text?: string } | null
  set?: Record<string, unknown> | null
  recommended?: boolean | null
  reinforced?: string | null
  materials: MaterialNeed[]
  sourceStatus: SourceStatus
  provenance: {
    gameData?: string | null
    recipe?: string | null
    image?: string | null
    evidence: string[]
  }
}

export interface RecipeEntry {
  name: string
  outputQuantity: number
  quantityExplicit: boolean
  profession?: string | null
  materials: MaterialNeed[]
  sourceStatus: SourceStatus
  evidence: string[]
}

export interface MaterialEntry {
  name: string
  icon?: string | null
  iconIndex?: number | null
  craftable: boolean
  outputQuantity?: number | null
  profession?: string | null
  usedBy: string[]
  sourceStatus: SourceStatus
}

export interface CatalogData {
  meta: {
    title: string
    subtitle: string
    costDefinition: string
    sourcePriority: string[]
    clericCorrections: Record<string, string>
    soulBeadResolution: string
    sprite: { path: string; tileSize: number; columns: number; count: number }
  }
  classes: string[]
  items: ItemEntry[]
  recipes: RecipeEntry[]
  materials: MaterialEntry[]
  reference: {
    acquisitionChannels: string[]
    acquisitionNote: string
    supplements: Array<Record<string, unknown>>
    spreadsheetTools: Array<Record<string, unknown>>
  }
}
