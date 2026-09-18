export const GATHERING_REVIEWED_AT = '2026-09-18'
export const GATHERING_SOURCE_URL = 'https://neverwinter.fandom.com/wiki/Gathering'
export const GATHERING_SOURCE_SCALE = 'legacy-1-80' as const
export const GATHERING_MAPPING_STATUS = 'unresolved-after-2021-compression' as const
export const GATHERING_COMPRESSION_SOURCE_URL = 'https://www.playneverwinter.com/en/news-details/11491453'

export interface GatheringReferenceTask {
  id: string
  name: string
  level: number
  outputQuantity: number
  profession: 'Gathering'
  inputs: readonly []
  sourceUrl: string
  reviewedAt: string
  platformContext: string
  confidence: 'historical-pre-compression-sample'
  plannerEligible: false
}

const raw: Array<[number,string]> = [
  [1,'Copper Ore'],
  [1,'Well Water'],
  [2,'Animal Hide'],
  [2,'Soot'],
  [3,'Cotton Boll'],
  [3,'Sandstone'],
  [4,'Maple Log'],
  [4,'Tin Ore'],
  [5,'Animal Bone'],
  [5,'Nettle'],
  [6,'Animal Sinew'],
  [7,'Toadstool'],
  [9,'Maple Sap'],
  [10,'Zinc Ore'],
  [11,'Beast Fang'],
  [13,'Flax'],
  [14,'Copper Sand'],
  [15,'Beast Blood'],
  [15,'Sword Coast Tea Leaves'],
  [16,'Deer Skin'],
  [17,'Rhubarb'],
  [18,'Iron Ore'],
  [19,'Ash Log'],
  [19,'Deer Sinew'],
  [20,'Aegwyrt'],
]

const slug = (value:string) => value.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export const gatheringReferenceTasks: GatheringReferenceTask[] = raw.map(([level,name]) => ({
  id:`gathering-${slug(name)}`,
  name,
  level,
  outputQuantity:12,
  profession:'Gathering',
  inputs:[],
  sourceUrl:GATHERING_SOURCE_URL,
  reviewedAt:GATHERING_REVIEWED_AT,
  platformContext:'Legacy community Gathering table using the pre-2021 profession level scale. These 25 rows are a historical sample, not a complete modern Level 1-20 route. The full 1-80 table still needs reconciliation against the 2021 compression and current task list.',
  confidence:'historical-pre-compression-sample',
  plannerEligible:false,
}))
