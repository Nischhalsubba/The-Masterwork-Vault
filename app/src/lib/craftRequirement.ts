import type { ItemEntry } from '../types'

export type CraftRequirement = {
  professionLevel: number | null
  source: 'campaign-rule' | 'unverified'
  note: string
}

export function getCraftRequirement(item: ItemEntry): CraftRequirement {
  const campaign = String(item.campaign ?? '').toLowerCase()
  if (campaign.includes('sharandar')) {
    return {
      professionLevel: 20,
      source: 'campaign-rule',
      note: 'Sharandar Masterwork requires profession level 20.',
    }
  }
  if (campaign.includes('underdark') || campaign.includes('menzoberranzan')) {
    return {
      professionLevel: 20,
      source: 'campaign-rule',
      note: 'Menzoberranzan Masterwork requires profession level 20.',
    }
  }
  return {
    professionLevel: null,
    source: 'unverified',
    note: 'No attributable crafting-level requirement is recorded for this item.',
  }
}

export function craftRequirementLabel(item: ItemEntry) {
  const requirement = getCraftRequirement(item)
  return requirement.professionLevel == null ? 'Profession level not captured' : `Profession level ${requirement.professionLevel}`
}
