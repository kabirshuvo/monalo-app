/** Normalize spoken / target text for kid ESL matching. */
export function normalizeSpeechText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[….]/g, ' ')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const rows = a.length + 1
  const cols = b.length + 1
  const dist: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) dist[i][0] = i
  for (let j = 0; j < cols; j++) dist[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + cost
      )
    }
  }
  return dist[a.length][b.length]
}

/**
 * Score how close a transcript is to the target (0–100).
 * Soft on kid ASR errors: substring / word overlap boosts the score.
 */
export function scoreSpeechMatch(transcript: string, targetSpeak: string): number {
  const heard = normalizeSpeechText(transcript)
  const want = normalizeSpeechText(targetSpeak)
  if (!heard || !want) return 0
  if (heard === want) return 100
  if (heard.includes(want) || want.includes(heard)) return 92

  const wantWords = want.split(' ').filter(Boolean)
  const heardWords = heard.split(' ').filter(Boolean)
  if (wantWords.length > 0) {
    const hit = wantWords.filter((w) => heardWords.some((h) => h === w || h.includes(w) || w.includes(h)))
    const wordScore = Math.round((hit.length / wantWords.length) * 100)
    if (wordScore >= 100) return 95
    if (wordScore >= 70) return Math.max(wordScore, 72)
  }

  const maxLen = Math.max(heard.length, want.length)
  const dist = levenshtein(heard, want)
  const similarity = Math.round((1 - dist / maxLen) * 100)
  return Math.max(0, Math.min(100, similarity))
}

/** Pass threshold for kids — forgiving for ASR noise. */
export const SPEECH_MATCH_PASS = 65
