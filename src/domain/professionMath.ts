export function highQualityChance(focus: number, minimumFocus: number, focusGoal: number) {
  if (![focus, minimumFocus, focusGoal].every(Number.isFinite)) return 0
  if (focusGoal <= minimumFocus) return focus >= focusGoal ? 1 : 0
  return Math.max(0, Math.min(1, (focus - minimumFocus) / (focusGoal - minimumFocus)))
}

export function craftingDuration(baseInterval: number, speedModifier: number) {
  if (!Number.isFinite(baseInterval) || baseInterval < 0 || !Number.isFinite(speedModifier)) return Number.NaN
  const multiplier = 1 + speedModifier / 100
  if (multiplier <= 0) return Number.POSITIVE_INFINITY
  return baseInterval / multiplier
}

export function moraleRefillCost(points: number, adPerPoint = 120, discountRate = 0) {
  const cleanPoints = Math.max(0, Number(points) || 0)
  const cleanRate = Math.max(0, Number(adPerPoint) || 0)
  const cleanDiscount = Math.max(0, Math.min(1, Number(discountRate) || 0))
  return Math.round(cleanPoints * cleanRate * (1 - cleanDiscount))
}

export function eventMoraleCost(baseCost: number, doubleProfessions: boolean) {
  const clean = Math.max(0, Number(baseCost) || 0)
  return doubleProfessions ? clean * 0.5 : clean
}
