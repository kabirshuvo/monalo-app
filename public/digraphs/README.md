# Digraphs media

## Images

- Digraph cards: `images/digraphs/{sh|ch|th|wh}.webp`
- Word pictures: `images/words/{digraph}/{slug}.webp`

Paths in `data/digraphs/*.json` use `/images/...` and resolve to `/digraphs/images/...` (see `lib/digraphs/assets.ts`).

Copy-paste AI prompts for all 44 word images + 4 cards: [`docs/digraphs-image-prompts.md`](../../docs/digraphs-image-prompts.md)

After adding `.webp` files, sync JSON extensions:

```bash
node scripts/sync-digraphs-image-paths.mjs --write
```

## Audio

Clips live under `audio/` mirroring the paths in JSON. Generate with:

```bash
npm run learning:generate-audio -- digraphs
```

Uses Edge neural TTS (`en-US-AnaNeural`). Re-run with `--force` to overwrite. Speech synthesis still works if a file is missing.

## R2 (production CDN)

```bash
node scripts/upload-digraphs-r2.mjs
```

Set `NEXT_PUBLIC_DIGRAPHS_USE_R2=1` when serving from R2 instead of the Worker static assets.
