# Vowel Words media

Drop final art here (overwrite placeholders):

- Vowel cards: `images/vowels/{a|e|i|o|u}.svg` (or `.webp` / `.png`)
- Word pictures: `images/{vowel}/{slug}.webp`

Paths in `data/vowel-words/words.json` and `vowels.json` look like `/images/a/cat.webp` and resolve to `/vowel-words/images/...` (see `lib/vowel-words/assets.ts`). Update the `image` fields if you change extensions or folders.

Optional audio (speech synthesis is the fallback):

- `audio/word/{vowel}/{slug}.mp3`
- `audio/phoneme/{vowel}.mp3`
- `audio/question/{vowel}.mp3`
- `audio/success/{vowel}/{slug}.mp3`
- `audio/error/{vowel}.mp3`

Served at `/vowel-words/...` in local/dev.
