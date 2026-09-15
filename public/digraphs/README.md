# Digraphs media

Drop art here:

- Digraph cards: `images/digraphs/{sh|ch|th|wh}.svg` (or `.webp`)
- Word pictures: `images/words/{digraph}/{slug}.svg` (or `.webp`)

Paths in `data/digraphs/*.json` look like `/images/words/sh/ship.svg` and resolve to `/digraphs/images/...` (see `lib/digraphs/assets.ts`).

Optional audio uses the same speech-synthesis fallback pattern as Vowel Words until mp3s are added.
