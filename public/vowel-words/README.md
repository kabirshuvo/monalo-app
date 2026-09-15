# Vowel Words media

Drop final art here (overwrite placeholders):

- Vowel cards: `images/vowels/{a|e|i|o|u}.svg` (or `.webp` / `.png`)
- Word pictures: `images/{vowel}/{slug}.webp`

Paths in `data/vowel-words/words.json` and `vowels.json` look like `/images/a/cat.webp` and resolve to `/vowel-words/images/...` (see `lib/vowel-words/assets.ts`). Update the `image` fields if you change extensions or folders.

## Audio

Clips live under `audio/` mirroring the paths in JSON. Generate with:

```bash
npm run learning:generate-audio -- vowel-words
```

Uses Edge neural TTS (`en-US-AnaNeural`). Re-run with `--force` to overwrite. Speech synthesis remains the fallback if a file is missing.

Served at `/vowel-words/...` in local/dev.
