export type EcoPenguinItemAudio = {
  itemAudio: string
  question: string
  success: string
  error: string
  warning: string
}

export type EcoPenguinCategoryMeta = {
  id: number
  name: string
  image: string
}

export type EcoPenguinItem = {
  id: number
  name: string
  image: string
  description: string
  audio: EcoPenguinItemAudio
}

export type EcoPenguinCategory = EcoPenguinCategoryMeta & {
  slug: string
}
