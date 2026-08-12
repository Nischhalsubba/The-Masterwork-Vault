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

export interface RankedReadinessAction extends ProfessionReadiness {
  priority: number
  priorityReason: string
}

const prices = (profession: MasterworkProfession) => masterworkUnlockPrices[profession]
const tierOrder: Record<ReadinessTier, number> = { level: 0, chultan1: 1, chultan2: 2, sharandar: 3, menzoberranzan: 4, complete: 5 }

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

export function rankedReadinessActions(state: PlayerState): RankedReadinessAction[] {
  return MASTERWORK_PROFESSIONS
    .map((profession) => readinessForProfession(profession, state.professions[profession]))
    .filter((row) => row.next.tier !== 'complete')
    .map((row) => {
      const priority = (100 - row.completion) * 100 + (5 - tierOrder[row.next.tier]) * 10 - Math.min(9, Math.floor(row.next.adCost / 1_000_000))
      const priorityReason = row.next.tier === 'level'
        ? `Level ${row.progress.level}/20 is the earliest recorded prerequisite still open.`
        : row.next.adCost > 0
          ? `${row.next.title} is the next direct unlock in this profession's recorded path.`
          : `${row.next.title} is the next recorded prerequisite.`
      return { ...row, priority, priorityReason }
    })
    .sort((a, b) => b.priority - a.priority || a.next.adCost - b.next.adCost || a.profession.localeCompare(b.profession))
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
