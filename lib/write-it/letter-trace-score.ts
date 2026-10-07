/**
 * Build a dilated letter mask from canvas text, and score kid ink against it.
 * Works for any letter without hand-authored SVG paths.
 */

export type TraceScore = {
  /** 0–100 combined score */
  score: number
  precision: number
  coverage: number
  inkPixels: number
  pass: boolean
}

const PASS_SCORE = 58
const MIN_INK = 80

function dilateMask(
  src: Uint8Array,
  w: number,
  h: number,
  radius: number
): Uint8Array {
  const out = new Uint8Array(src.length)
  const r2 = radius * radius
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!src[y * w + x]) continue
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          out[ny * w + nx] = 1
        }
      }
    }
  }
  return out
}

/** Draw letter into an offscreen canvas and return a binary mask (1 = letter body). */
export function buildLetterMask(
  letter: string,
  width: number,
  height: number,
  dilatePx = 16
): { mask: Uint8Array; width: number; height: number; coreCount: number } {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return { mask: new Uint8Array(width * height), width, height, coreCount: 0 }
  }

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontSize = Math.floor(Math.min(width, height) * 0.72)
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`
  ctx.fillText(letter, width / 2, height / 2 + fontSize * 0.04)

  const { data } = ctx.getImageData(0, 0, width, height)
  const core = new Uint8Array(width * height)
  let coreCount = 0
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (data[i + 3] > 40) {
      core[p] = 1
      coreCount++
    }
  }

  const mask = dilateMask(core, width, height, dilatePx)
  return { mask, width, height, coreCount }
}

/** Sample ordered guide points roughly along the letter for demo / dots. */
export function sampleLetterGuidePoints(
  mask: Uint8Array,
  width: number,
  height: number,
  count = 12
): { x: number; y: number }[] {
  const points: { x: number; y: number; key: number }[] = []
  const step = 3
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (!mask[y * width + x]) continue
      // Prefer edge-ish pixels: skip if fully surrounded (cheap interior filter)
      let neighbors = 0
      for (let dy = -step; dy <= step; dy += step) {
        for (let dx = -step; dx <= step; dx += step) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          if (mask[ny * width + nx]) neighbors++
        }
      }
      if (neighbors > 7) continue
      // Writing-ish order: top→bottom, left→right with slight diagonal bias
      points.push({ x, y, key: y * width + x * 0.35 })
    }
  }
  points.sort((a, b) => a.key - b.key)
  if (points.length === 0) return []
  const picked: { x: number; y: number }[] = []
  const stride = Math.max(1, Math.floor(points.length / count))
  for (let i = 0; i < points.length && picked.length < count; i += stride) {
    picked.push({ x: points[i].x, y: points[i].y })
  }
  return picked
}

export function scoreInkAgainstMask(
  inkCanvas: HTMLCanvasElement,
  mask: Uint8Array,
  maskW: number,
  maskH: number,
  coreCount: number
): TraceScore {
  const ctx = inkCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return { score: 0, precision: 0, coverage: 0, inkPixels: 0, pass: false }
  }

  // Bitmap pixels (device pixels) — transform does not apply to getImageData coords
  const bw = inkCanvas.width
  const bh = inkCanvas.height
  if (bw < 2 || bh < 2) {
    return { score: 0, precision: 0, coverage: 0, inkPixels: 0, pass: false }
  }

  const { data } = ctx.getImageData(0, 0, bw, bh)
  let ink = 0
  let inkOnLetter = 0
  const hitCore = new Set<number>()

  const scaleX = maskW / bw
  const scaleY = maskH / bh

  for (let y = 0; y < bh; y += 2) {
    for (let x = 0; x < bw; x += 2) {
      const i = (y * bw + x) * 4
      if (data[i + 3] < 30) continue
      ink++
      const mx = Math.min(maskW - 1, Math.floor(x * scaleX))
      const my = Math.min(maskH - 1, Math.floor(y * scaleY))
      const mi = my * maskW + mx
      if (mask[mi]) {
        inkOnLetter++
        hitCore.add(mi)
      }
    }
  }

  // Scale min ink for retina (roughly dpr^2)
  const minInk = Math.max(MIN_INK, Math.floor((bw * bh) / 18000))

  if (ink < minInk) {
    return { score: 0, precision: 0, coverage: 0, inkPixels: ink, pass: false }
  }

  const precision = inkOnLetter / ink
  const coverage = Math.min(1, hitCore.size / Math.max(40, coreCount / 40))
  const score = Math.round((precision * 0.65 + coverage * 0.35) * 100)
  const pass = score >= PASS_SCORE && precision >= 0.45 && coverage >= 0.18

  return { score, precision, coverage, inkPixels: ink, pass }
}

export { PASS_SCORE }
