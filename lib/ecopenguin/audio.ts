import { resolveEcoPenguinAsset } from '@/lib/ecopenguin/assets'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'

export function buildThisIsAudioUrl(categorySlug: string, itemName: string): string {
  const itemSlug = itemNameToSlug(itemName)
  return resolveEcoPenguinAsset(`/audio/this/${categorySlug}/${itemSlug}.mp3`)
}

export function buildWhichQuestionAudioUrl(categorySlug: string, itemName: string): string {
  const itemSlug = itemNameToSlug(itemName)
  return resolveEcoPenguinAsset(`/audio/which/${categorySlug}/q-${itemSlug}.mp3`)
}

export function buildCorrectAudioUrl(categorySlug: string, itemName: string): string {
  const itemSlug = itemNameToSlug(itemName)
  return resolveEcoPenguinAsset(`/audio/correct/${categorySlug}/c-${itemSlug}.mp3`)
}

export function buildErrorAudioUrl(categorySlug: string, itemName: string): string {
  const itemSlug = itemNameToSlug(itemName)
  return resolveEcoPenguinAsset(`/audio/error/${categorySlug}/n-${itemSlug}.mp3`)
}

export function buildWhichOneIntroUrl(): string {
  return resolveEcoPenguinAsset('/audio/whichone.mp3')
}
