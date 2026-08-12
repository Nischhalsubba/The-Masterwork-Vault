import { masterworkUnlockPrices } from '../data/craftingKnowledgePool'
import type { MasterworkProfession, PlayerState, ProfessionProgress } from './playerState'
import { MASTERWORK_PROFESSIONS } from './playerState'

export type ReadinessTier = 'level' | 'chultan1' | 'chultan2' | 'sharandar' | 'menzoberranzan' | 'complete'

export interface ReadinessAction {
  tier: ReadinessTier
  title: string
  detail: string
  adCost: number
}

export interface ProfessionReadiness {
  profession: MasterworkProfession
  progress: ProfessionProgress
  completion: number
  next: ReadinessAction
  spentBookAd: number
  remainingBookAd: number
}

const prices = (profession: MasterworkProfession) => masterworkUnlockPrices[profession]

export function nextReadinessAction(profession: MasterworkProfession, progress: ProfessionProgress): ReadinessAction {
  const row = prices(profession)
  if (progress.level < 20) return { tier: 'level', title: `Reach ${profession} Level 20`, detail: `Current level ${progress.level}. Exact Level 1→20 XP thresholds remain intentionally unknown.`, adCost: 0 }
  if (!progress.chultan1) return { tier: 'chultan1', title: 'Unlock Chultan Masterwork I', detail: 'First modern Chultan Masterwork stage.', adCost: row.chultanMW1 }
  if (!progress.chultan2) return { tier: 'chultan2', title: 'Unlock Chultan Masterwork II', detail: 'Requires Chultan Masterwork I first.', adCost: row.chultanMW2 }
  if (!progress.sharandar) return { tier: 'sharandar', title: 'Unlock Sharandar Masterwork', detail: 'Requires the Chultan progression and profession Level 20.', adCost: row.sharandarMW }
  if (!progress.menzoberranzan) return { tier: 'menzoberranzan', title: 'Unlock Menzoberranzan Masterwork', detail: 'Account-wide prerequisites include all seven professions at Level 20 and earlier Masterwork progression.', adCost: row.menzoberranzanMW }
  return { tier: 'complete', title: 'Masterwork path complete', detail: 'This profession is marked through Menzoberranzan.', adCost: 0 }
}

export function readinessForProfession(profession: MasterworkProfession, progress: ProfessionProgress): ProfessionReadiness {
  const row = prices(profession)
  const checkpoints = [progress.level >= 20, progress.chultan1, progress.chultan2, progress.sharandar, progress.menzoberranzan]
  const completion = Math.round((checkpoints.filter(Boolean).length / checkpoints.length) * 100)
  const spentBookAd = (progress.chultan1 ? row.chultanMW1 : 0)
    + (progress.chultan2 ? row.chultanMW2 : 0)
    + (progress.sharandar ? row.sharandarMW : 0)
    + (progress.menzoberranzan ? row.menzoberranzanMW : 0)
  const total = row.chultanMW1 + row.chultanMW2 + row.sharandarMW + row.menzoberranzanMW
  return {
    profession,
    progress,
    completion,
    next: nextReadinessAction(profession, progress),
    spentBookAd,
    remainingBookAd: Math.max(0, total - spentBookAd),
  }
}

export function readinessSummary(state: PlayerState) {
  const professions = MASTERWORK_PROFESSIONS.map((profession) => readinessForProfession(profession, state.professions[profession]))
  const completion = Math.round(professions.reduce((sum, row) => sum + row.completion, 0) / professions.length)
  const remainingBookAd = professions.reduce((sum, row) => sum + row.remainingBookAd, 0)
  const spentBookAd = professions.reduce((sum, row) => sum + row.spentBookAd, 0)
  const level20Count = professions.filter((row) => row.progress.level >= 20).length
  const readyForMenzoQuest = professions.every((row) => row.progress.level >= 20 && row.progress.chultan2 && row.progress.sharandar)
  const next = professions
    .filter((row) => row.next.tier !== 'complete')
    .sort((a, b) => a.completion - b.completion || a.profession.localeCompare(b.profession))[0] ?? null
  return { professions, completion, remainingBookAd, spentBookAd, level20Count, readyForMenzoQuest, next }
}
