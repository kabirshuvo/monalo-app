/** Client-side preference keys (localStorage until we add a DB column). */

export const PREF_KEYS = {
  learningReminders: 'monalo_pref_learning_reminders',
  pointsMilestones: 'monalo_pref_points_milestones',
  productUpdates: 'monalo_pref_product_updates',
  compactNav: 'monalo_pref_compact_nav',
} as const

export type UserPreferences = {
  learningReminders: boolean
  pointsMilestones: boolean
  productUpdates: boolean
  compactNav: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  learningReminders: true,
  pointsMilestones: true,
  productUpdates: false,
  compactNav: false,
}

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES }
  return {
    learningReminders:
      localStorage.getItem(PREF_KEYS.learningReminders) !== 'false',
    pointsMilestones: localStorage.getItem(PREF_KEYS.pointsMilestones) !== 'false',
    productUpdates: localStorage.getItem(PREF_KEYS.productUpdates) === 'true',
    compactNav: localStorage.getItem(PREF_KEYS.compactNav) === 'true',
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREF_KEYS.learningReminders, String(prefs.learningReminders))
  localStorage.setItem(PREF_KEYS.pointsMilestones, String(prefs.pointsMilestones))
  localStorage.setItem(PREF_KEYS.productUpdates, String(prefs.productUpdates))
  localStorage.setItem(PREF_KEYS.compactNav, String(prefs.compactNav))
}
