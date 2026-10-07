export type DecodableStoryPage = {
  text: string
  words: string[]
  /** Optional picture for the page (public path) */
  image?: string
}

export type DecodableStory = {
  id: string
  title: string
  requiredGroup: string
  pages: DecodableStoryPage[]
}
