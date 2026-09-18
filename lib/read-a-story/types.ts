export type DecodableStoryPage = {
  text: string
  words: string[]
}

export type DecodableStory = {
  id: string
  title: string
  requiredGroup: string
  pages: DecodableStoryPage[]
}
