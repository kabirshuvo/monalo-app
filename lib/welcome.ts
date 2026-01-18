import welcomeData from '../data/welcomeMessages.json'

export type WelcomeType = 'new' | 'returning'

export function getRandomWelcome(type: WelcomeType): string {
  try {
    const data: any = welcomeData as any
    const list = type === 'new' ? data.newUser || [] : data.returningUser || []
    if (!list || list.length === 0) return 'Welcome.'
    return list[Math.floor(Math.random() * list.length)]
  } catch {
    return 'Welcome.'
  }
}
