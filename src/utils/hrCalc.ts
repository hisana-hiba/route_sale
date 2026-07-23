/** Shared HR achievement / incentive calculations (Target → Incentive → Payroll) */

const INCENTIVE_ROLE_BASE: Record<string, number> = {
  Salesman: 15000,
  'Delivery Agent': 8000,
  Driver: 6000,
  Manager: 20000,
}

export function calculateAchievementPercent(targetValue: number, achievedValue: number) {
  const safeTarget = Math.max(targetValue, 1)
  return Math.round((achievedValue / safeTarget) * 100)
}

export function calculateIncentive(role: string, target: number, achieved: number) {
  const achievementPercent = calculateAchievementPercent(target, achieved)
  const base = INCENTIVE_ROLE_BASE[role] ?? 10000
  let incentiveEarned = 0
  if (achievementPercent >= 100) {
    incentiveEarned = Math.round(base * (1 + (achievementPercent - 100) / 200))
  } else if (achievementPercent >= 70) {
    incentiveEarned = Math.round(base * (achievementPercent / 100))
  }
  return { achievementPercent, incentiveEarned }
}
