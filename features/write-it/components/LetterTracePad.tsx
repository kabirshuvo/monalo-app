'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { writeItTheme } from '@/features/write-it/write-it-theme'
import {
  buildLetterMask,
  sampleLetterGuidePoints,
  scoreInkAgainstMask,
  type TraceScore,
} from '@/lib/write-it/letter-trace-score'

export type LetterTracePadHandle = {
  clear: () => void
  playDemo: () => Promise<void>
  score: () => TraceScore
}

type Props = {
  letter: string
  onHasInkChange?: (hasInk: boolean) => void
  disabled?: boolean
}

const LetterTracePad = forwardRef<LetterTracePadHandle, Props>(function LetterTracePad(
  { letter, onHasInkChange, disabled = false },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const demoRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<{
    mask: Uint8Array
    width: number
    height: number
    coreCount: number
  } | null>(null)
  const guideRef = useRef<{ x: number; y: number }[]>([])
  const drawing = useRef(false)
  const demoRunning = useRef(false)
  const [hasInk, setHasInk] = useState(false)
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [guideDots, setGuideDots] = useState<{ x: number; y: number }[]>([])

  const syncInk = (next: boolean) => {
    setHasInk(next)
    onHasInkChange?.(next)
  }

  const rebuildMask = (cssW: number, cssH: number) => {
    const built = buildLetterMask(letter, Math.max(1, Math.floor(cssW)), Math.max(1, Math.floor(cssH)), 18)
    maskRef.current = built
    const guides = sampleLetterGuidePoints(built.mask, built.width, built.height, 10)
    guideRef.current = guides
    setGuideDots(guides)
  }

  const clearInk = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    syncInk(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const demo = demoRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const c of [canvas, demo]) {
        if (!c) continue
        c.width = Math.floor(rect.width * dpr)
        c.height = Math.floor(rect.height * dpr)
        c.style.width = `${rect.width}px`
        c.style.height = `${rect.height}px`
        const ctx = c.getContext('2d')
        if (!ctx) continue
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, rect.width, rect.height)
      }
      rebuildMask(rect.width, rect.height)
      syncInk(false)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter])

  const playDemo = () =>
    new Promise<void>((resolve) => {
      const demo = demoRef.current
      const guides = guideRef.current
      if (!demo || guides.length < 2) {
        resolve()
        return
      }
      const ctx = demo.getContext('2d')
      if (!ctx) {
        resolve()
        return
      }
      demoRunning.current = true
      setDemoPlaying(true)
      const rect = demo.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      let i = 0
      const step = () => {
        if (!demoRunning.current) {
          resolve()
          return
        }
        ctx.clearRect(0, 0, rect.width, rect.height)
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.9)'
        ctx.lineWidth = 8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(guides[0].x, guides[0].y)
        for (let j = 1; j <= i && j < guides.length; j++) {
          ctx.lineTo(guides[j].x, guides[j].y)
        }
        ctx.stroke()

        const tip = guides[Math.min(i, guides.length - 1)]
        ctx.fillStyle = '#fda4af'
        ctx.beginPath()
        ctx.arc(tip.x, tip.y, 10, 0, Math.PI * 2)
        ctx.fill()

        i++
        if (i >= guides.length) {
          window.setTimeout(() => {
            ctx.clearRect(0, 0, rect.width, rect.height)
            demoRunning.current = false
            setDemoPlaying(false)
            resolve()
          }, 350)
          return
        }
        window.setTimeout(step, 90)
      }
      step()
    })

  useImperativeHandle(ref, () => ({
    clear: clearInk,
    playDemo,
    score: () => {
      const canvas = canvasRef.current
      const mask = maskRef.current
      if (!canvas || !mask) {
        return { score: 0, precision: 0, coverage: 0, inkPixels: 0, pass: false }
      }
      return scoreInkAgainstMask(canvas, mask.mask, mask.width, mask.height, mask.coreCount)
    },
  }))

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || demoPlaying) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const p = point(e)
    if (!canvas || !ctx || !p) return
    canvas.setPointerCapture(e.pointerId)
    drawing.current = true
    ctx.strokeStyle = '#fafaf9'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled || demoPlaying) return
    const ctx = canvasRef.current?.getContext('2d')
    const p = point(e)
    if (!ctx || !p) return
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    if (!hasInk) syncInk(true)
  }

  const end = () => {
    drawing.current = false
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-sm touch-none overflow-hidden rounded-3xl border border-[#fafaf9]/25 bg-[#0c0a09]">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[min(55vw,14rem)] font-black leading-none text-[#fafaf9]/20 select-none"
          aria-hidden
        >
          {letter}
        </div>
        {/* Guide dots */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {guideDots.map((d, idx) => (
            <span
              key={`${d.x}-${d.y}-${idx}`}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-300/70"
              style={{ left: d.x, top: d.y }}
            />
          ))}
        </div>
        <canvas ref={demoRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label={`Trace the letter ${letter}`}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => void playDemo()}
          className={`${writeItTheme.btnSecondary} px-4 py-2`}
          disabled={disabled || demoPlaying}
        >
          {demoPlaying ? 'Watching…' : 'Watch first'}
        </button>
        <button
          type="button"
          onClick={clearInk}
          className={`${writeItTheme.btnSecondary} px-4 py-2`}
          disabled={disabled || demoPlaying}
        >
          Clear
        </button>
      </div>
    </div>
  )
})

export default LetterTracePad
