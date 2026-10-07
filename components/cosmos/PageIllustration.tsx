import type { JSX, ReactNode } from 'react'
import type { PlanetId } from '@/lib/cosmos/planets'

/**
 * Hand-drawn scenes for each page, in one flat storybook style.
 * Colours come from the surrounding [data-tone] (see globals.css): --il-light,
 * --il-base, --il-dark, plus --il-paper and the sun for warm light.
 * Each scene sits on a soft disc with an orbit line, so it belongs to the sky.
 */

const L = 'var(--il-light)'
const B = 'var(--il-base)'
const D = 'var(--il-dark)'
const P = 'var(--il-paper)'
const INK = 'var(--il-ink)'
const LINE = 'var(--il-line)'
const SUN = '#ffb547'
const SUN_LIGHT = '#ffd98a'
const LEAF = 'var(--il-leaf, #5bbf7a)'

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 400 340" className="page-illustration" role="img" aria-label={label}>
      {/* Backdrop disc and orbit */}
      <circle cx="200" cy="168" r="150" fill="var(--il-disc)" />
      <ellipse
        cx="200"
        cy="172"
        rx="192"
        ry="58"
        transform="rotate(-12 200 172)"
        fill="none"
        stroke="var(--tone-line)"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <circle cx="372" cy="122" r="7" fill={B} />
      <circle cx="30" cy="214" r="4" fill={L} />
      {/* Ground shadow */}
      <ellipse cx="200" cy="300" rx="158" ry="12" fill="#05081e" opacity="0.22" />
      {children}
    </svg>
  )
}

function Sparkle({ x, y, s = 1, fill = SUN_LIGHT }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z"
      fill={fill}
    />
  )
}

/** School home — the schoolhouse with a sun window, books and a tree */
export function SchoolScene() {
  return (
    <Frame label="A schoolhouse with a sun-shaped window, a stack of books and a tree">
      {/* path */}
      <path d="M184 296 H216 L240 322 H160 Z" fill={L} opacity="0.55" />
      {/* tree */}
      <rect x="318" y="226" width="9" height="70" rx="3" fill={D} />
      <circle cx="322" cy="210" r="32" fill={B} />
      <circle cx="306" cy="222" r="18" fill={L} opacity="0.5" />
      {/* building */}
      <rect x="110" y="164" width="180" height="132" rx="6" fill={P} />
      <path d="M94 170 L200 92 L306 170 Z" fill={B} />
      <path d="M200 92 L306 170 H262 Z" fill={D} opacity="0.28" />
      {/* bell tower */}
      <rect x="184" y="58" width="32" height="40" rx="3" fill={P} />
      <path d="M178 62 L200 38 L222 62 Z" fill={D} />
      <circle cx="200" cy="80" r="7" fill={B} />
      {/* sun window */}
      <circle cx="200" cy="140" r="17" fill={L} />
      <circle cx="200" cy="140" r="10" fill={SUN} />
      {/* windows */}
      <rect x="128" y="196" width="38" height="38" rx="5" fill={L} />
      <rect x="234" y="196" width="38" height="38" rx="5" fill={L} />
      <path d="M147 196 V234 M128 215 H166 M253 196 V234 M234 215 H272" stroke={P} strokeWidth="3" />
      {/* door */}
      <path d="M182 296 V246 a18 18 0 0 1 36 0 V296 Z" fill={D} />
      <circle cx="210" cy="272" r="2.6" fill={SUN_LIGHT} />
      {/* books */}
      <rect x="40" y="272" width="62" height="13" rx="3" fill={B} />
      <rect x="46" y="259" width="54" height="13" rx="3" fill={D} />
      <rect x="42" y="246" width="58" height="13" rx="3" fill={L} />
      <rect x="40" y="285" width="64" height="11" rx="3" fill={D} opacity="0.8" />
      <Sparkle x={86} y={96} s={1.1} />
      <Sparkle x={320} y={150} s={0.7} />
    </Frame>
  )
}

/** About — a desk lamp lighting an open notebook: light of the mind */
export function AboutScene() {
  return (
    <Frame label="A desk lamp shining on an open notebook beside a stack of books and a mug">
      {/* lamp light */}
      <path d="M236 176 L262 166 L336 286 L188 286 Z" fill={SUN} opacity="0.16" />
      {/* desk */}
      <rect x="32" y="286" width="336" height="14" rx="5" fill={D} />
      {/* books */}
      <rect x="44" y="270" width="78" height="16" rx="3" fill={B} />
      <rect x="50" y="254" width="70" height="16" rx="3" fill={L} />
      <rect x="46" y="238" width="74" height="16" rx="3" fill={D} />
      <rect x="54" y="244" width="40" height="3" rx="1.5" fill={P} opacity="0.6" />
      {/* lamp */}
      <ellipse cx="150" cy="284" rx="30" ry="7" fill={D} />
      <path d="M150 282 L170 200 L226 164" stroke={B} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="170" cy="200" r="7" fill={D} />
      <path d="M212 146 L272 170 L252 196 L198 170 Z" fill={B} />
      <path d="M212 146 L272 170 L262 182 Z" fill={L} opacity="0.5" />
      <circle cx="252" cy="184" r="7" fill={SUN_LIGHT} />
      {/* notebook */}
      <path d="M196 284 L266 278 L266 236 L196 242 Z" fill={P} />
      <path d="M266 278 L336 284 L336 242 L266 236 Z" fill="#ece4d1" />
      <path d="M206 256 L254 252 M206 266 L246 263 M276 252 L322 256 M276 262 L314 265" stroke={B} strokeWidth="3" strokeLinecap="round" />
      {/* an idea, drawn on the page */}
      <circle cx="300" cy="270" r="6" fill="none" stroke={SUN} strokeWidth="2.5" />
      {/* mug */}
      <rect x="338" y="252" width="24" height="32" rx="5" fill={L} />
      <path d="M362 260 h5 a6 6 0 0 1 0 14 h-5" stroke={L} strokeWidth="4" fill="none" />
      <Sparkle x={300} y={112} s={1} />
      <Sparkle x={330} y={140} s={0.6} />
      <Sparkle x={110} y={120} s={0.7} fill={L} />
    </Frame>
  )
}

/** Courses — a lesson on a laptop, progress filling up, a pencil and a finished task */
export function CoursesScene() {
  return (
    <Frame label="A laptop playing a video lesson with a progress bar, a pencil and a completed checklist">
      {/* small Earth */}
      <g className="il-float">
        <circle cx="338" cy="70" r="24" fill={B} />
        <ellipse cx="330" cy="62" rx="9" ry="6" fill={LEAF} />
        <ellipse cx="346" cy="80" rx="7" ry="5" fill={LEAF} />
      </g>
      {/* laptop screen */}
      <rect x="92" y="92" width="216" height="142" rx="12" fill={D} />
      <rect x="104" y="104" width="192" height="114" rx="5" fill={L} />
      {/* video */}
      <rect x="116" y="116" width="112" height="72" rx="5" fill={B} />
      <circle cx="172" cy="152" r="17" fill={P} opacity="0.95" />
      <path d="M166 142 V162 L182 152 Z" fill={B} />
      {/* lesson list */}
      {[120, 140, 160, 180].map((y, i) => (
        <g key={y}>
          <circle cx="244" cy={y + 4} r="5" fill={i < 2 ? LEAF : P} />
          <rect x="254" y={y} width={i === 3 ? 26 : 32} height="8" rx="4" fill={D} opacity={i < 2 ? 0.7 : 0.35} />
        </g>
      ))}
      {/* progress */}
      <rect x="116" y="198" width="168" height="8" rx="4" fill={P} />
      <rect x="116" y="198" width="104" height="8" rx="4" fill={LEAF} />
      {/* keyboard base */}
      <path d="M70 234 H330 L348 258 H52 Z" fill={B} />
      <rect x="176" y="240" width="48" height="5" rx="2.5" fill={D} />
      {/* notebook + pencil */}
      <rect x="252" y="262" width="86" height="30" rx="4" fill={P} transform="rotate(-4 295 277)" />
      <path d="M262 272 H322 M262 281 H310" stroke={B} strokeWidth="2.5" strokeLinecap="round" transform="rotate(-4 295 277)" />
      <g transform="rotate(-18 120 278)">
        <rect x="70" y="272" width="84" height="12" rx="2" fill={SUN} />
        <path d="M154 272 L172 278 L154 284 Z" fill="#f3d6a8" />
        <path d="M166 276 L172 278 L166 280 Z" fill={INK} />
        <rect x="62" y="272" width="10" height="12" rx="2" fill="#ec7448" />
      </g>
      {/* finished task */}
      <g className="il-float" style={{ animationDelay: '-3s' }}>
        <rect x="34" y="70" width="70" height="50" rx="10" fill={P} />
        <path d="M52 96 L64 107 L86 84" stroke={LEAF} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </Frame>
  )
}

/** Craft shop — shelves of gypsum pottery, a lit candle, a bamboo basket and a bowl */
export function ShopScene() {
  return (
    <Frame label="Wooden shelves holding a white gypsum vase, a lit candle, a bamboo basket and a clay bowl">
      {/* upper shelf */}
      <rect x="150" y="118" width="190" height="10" rx="3" fill={D} />
      <path d="M168 94 H236 Q232 118 202 118 Q172 118 168 94 Z" fill={B} />
      <path d="M176 102 H228" stroke={L} strokeWidth="3" strokeLinecap="round" />
      <rect x="264" y="88" width="32" height="30" rx="6" fill={P} />
      <path d="M280 88 C276 72 266 66 258 66 C262 76 270 82 280 88 Z M280 88 C284 70 296 62 306 64 C302 76 292 84 280 88 Z" fill={LEAF} />
      {/* lower shelf */}
      <rect x="36" y="262" width="328" height="12" rx="3" fill={D} />
      <rect x="60" y="274" width="10" height="22" rx="2" fill={D} />
      <rect x="330" y="274" width="10" height="22" rx="2" fill={D} />
      {/* gypsum vase */}
      <path
        d="M104 262 C78 262 74 212 92 190 C100 178 98 166 94 156 H130 C126 166 124 178 132 190 C150 212 146 262 120 262 Z"
        fill={P}
      />
      <path d="M86 214 C100 220 124 220 140 214" stroke={B} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M84 230 C100 236 124 236 142 230" stroke={L} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="112" cy="156" rx="18" ry="4" fill="#e3dac4" />
      {/* candle */}
      <rect x="168" y="204" width="48" height="58" rx="7" fill={L} />
      <rect x="168" y="222" width="48" height="16" fill={B} opacity="0.55" />
      <ellipse cx="192" cy="204" rx="24" ry="5" fill={P} />
      <path d="M192 204 V194" stroke={LINE} strokeWidth="2" />
      <path className="il-flicker" d="M192 166 C200 178 202 186 192 196 C182 186 184 178 192 166 Z" fill={SUN} />
      <circle cx="192" cy="186" r="20" fill={SUN} opacity="0.12" />
      {/* bamboo basket */}
      <path d="M236 216 H312 L302 262 H246 Z" fill={B} />
      <path d="M240 230 H308 M243 244 H305 M246 256 H302" stroke={D} strokeWidth="2.5" opacity="0.45" />
      <path d="M256 216 V262 M274 216 V262 M292 216 V262" stroke={L} strokeWidth="2" opacity="0.4" />
      <path d="M244 216 C248 182 300 182 304 216" stroke={D} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* price tag */}
      <path d="M318 226 L344 226 L352 236 L344 246 L318 246 Z" fill={P} />
      <circle cx="344" cy="236" r="2.5" fill={B} />
      <Sparkle x={70} y={110} s={0.8} />
    </Frame>
  )
}

/** Gallery — an easel with a painting, a palette and a jar of brushes */
export function GalleryScene() {
  return (
    <Frame label="A painting on a wooden easel, with a paint palette and a jar of brushes">
      {/* easel */}
      <path d="M200 58 L132 298 M200 58 L268 298 M200 58 V298" stroke={D} strokeWidth="8" strokeLinecap="round" />
      {/* canvas */}
      <rect x="114" y="82" width="172" height="130" rx="4" fill={P} />
      <rect x="124" y="92" width="152" height="110" rx="2" fill={L} />
      <circle cx="236" cy="124" r="16" fill={SUN} />
      <path d="M124 176 C150 150 172 152 196 168 C220 150 250 146 276 166 V202 H124 Z" fill={B} />
      <path d="M124 190 C160 172 210 178 276 186 V202 H124 Z" fill={D} />
      <rect x="108" y="212" width="184" height="10" rx="3" fill={D} />
      {/* palette */}
      <path
        d="M40 270 C40 244 70 232 98 236 C124 240 132 258 116 266 C106 271 112 284 100 290 C80 298 40 294 40 270 Z"
        fill={P}
      />
      <circle cx="66" cy="252" r="7" fill={B} />
      <circle cx="88" cy="248" r="6" fill="#ec7448" />
      <circle cx="58" cy="274" r="6" fill="#4cb0ee" />
      <circle cx="80" cy="280" r="5" fill={D} />
      <circle cx="108" cy="254" r="5" fill="var(--tone-soft)" />
      {/* brush jar */}
      <path d="M306 186 L318 248" stroke={D} strokeWidth="4" strokeLinecap="round" />
      <path d="M302 184 L306 196" stroke={B} strokeWidth="8" strokeLinecap="round" />
      <path d="M340 180 L330 248" stroke={D} strokeWidth="4" strokeLinecap="round" />
      <path d="M342 176 L339 190" stroke="#ec7448" strokeWidth="8" strokeLinecap="round" />
      <path d="M324 194 V248" stroke={D} strokeWidth="4" strokeLinecap="round" />
      <path d="M324 190 V202" stroke={L} strokeWidth="8" strokeLinecap="round" />
      <rect x="302" y="236" width="44" height="58" rx="8" fill={L} opacity="0.92" />
      <rect x="302" y="262" width="44" height="32" rx="8" fill={B} opacity="0.5" />
      <Sparkle x={84} y={110} s={0.9} />
      <Sparkle x={320} y={98} s={0.7} />
    </Frame>
  )
}

/** Team — a workstation with code, a design tablet, a camera and a conversation */
export function TeamScene() {
  return (
    <Frame label="A desk with a monitor showing code, a drawing tablet, a video camera and chat bubbles">
      {/* desk */}
      <rect x="30" y="268" width="340" height="14" rx="5" fill={D} />
      {/* monitor */}
      <rect x="196" y="230" width="16" height="38" fill={D} />
      <rect x="168" y="262" width="72" height="8" rx="4" fill={D} />
      <rect x="114" y="104" width="180" height="128" rx="10" fill={D} />
      <rect x="124" y="114" width="160" height="104" rx="4" fill={INK} />
      <path d="M150 150 L138 162 L150 174 M178 150 L190 162 L178 174 M170 146 L158 178" stroke={L} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="204" y="134" width="58" height="7" rx="3.5" fill={B} />
      <rect x="204" y="150" width="42" height="7" rx="3.5" fill={L} opacity="0.7" />
      <rect x="216" y="166" width="50" height="7" rx="3.5" fill={B} opacity="0.8" />
      <rect x="204" y="182" width="34" height="7" rx="3.5" fill={L} opacity="0.5" />
      <rect x="138" y="200" width="70" height="6" rx="3" fill={B} opacity="0.4" />
      {/* tablet */}
      <g transform="rotate(-8 82 236)">
        <rect x="42" y="208" width="84" height="58" rx="8" fill={B} />
        <rect x="50" y="216" width="68" height="42" rx="4" fill={P} />
        <circle cx="72" cy="237" r="10" fill="none" stroke={D} strokeWidth="3" />
        <rect x="88" y="227" width="20" height="20" rx="2" fill={L} />
      </g>
      <path d="M118 262 L146 218" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      {/* camera */}
      <rect x="306" y="222" width="58" height="46" rx="8" fill={B} />
      <rect x="318" y="212" width="20" height="12" rx="3" fill={D} />
      <circle cx="335" cy="245" r="14" fill={D} />
      <circle cx="335" cy="245" r="7" fill={L} />
      <circle cx="354" cy="230" r="3" fill="#ec7448" />
      {/* conversation */}
      <g className="il-float">
        <rect x="58" y="78" width="86" height="40" rx="14" fill={P} />
        <path d="M78 118 L74 132 L92 118 Z" fill={P} />
        <circle cx="84" cy="98" r="4" fill={B} />
        <circle cx="100" cy="98" r="4" fill={B} />
        <circle cx="116" cy="98" r="4" fill={B} />
      </g>
      <g className="il-float" style={{ animationDelay: '-3.5s' }}>
        <rect x="282" y="58" width="76" height="36" rx="14" fill={B} />
        <path d="M336 94 L344 106 L326 94 Z" fill={B} />
        <path d="M304 76 L314 84 L332 68" stroke={P} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </Frame>
  )
}

/** Blog — articles to read, a cup of tea and reading glasses */
export function BlogScene() {
  return (
    <Frame label="Two printed articles with headlines and pictures, a cup of tea and a pair of reading glasses">
      {/* back article */}
      <g transform="rotate(-8 170 180)">
        <rect x="92" y="78" width="150" height="196" rx="8" fill={L} />
      </g>
      {/* front article */}
      <g transform="rotate(4 210 186)">
        <rect x="130" y="80" width="160" height="206" rx="8" fill={P} />
        <rect x="148" y="100" width="110" height="12" rx="6" fill={D} />
        <rect x="148" y="118" width="80" height="12" rx="6" fill={D} />
        <rect x="148" y="142" width="124" height="62" rx="6" fill={B} />
        <circle cx="238" cy="162" r="10" fill={SUN_LIGHT} />
        <path d="M148 196 L182 172 L210 192 L232 180 L272 204 H148 Z" fill={D} opacity="0.55" />
        {[218, 232, 246, 260].map((y, i) => (
          <rect key={y} x="148" y={y} width={i === 3 ? 74 : 124} height="6" rx="3" fill={B} opacity="0.55" />
        ))}
      </g>
      {/* tea */}
      <ellipse cx="324" cy="292" rx="36" ry="8" fill={D} opacity="0.6" />
      <path d="M298 248 H346 V270 C346 284 336 292 322 292 C308 292 298 284 298 270 Z" fill={B} />
      <path d="M346 256 h6 a8 8 0 0 1 0 16 h-6" stroke={B} strokeWidth="5" fill="none" />
      <ellipse cx="322" cy="248" rx="24" ry="5" fill={D} />
      <path className="il-float" d="M314 236 C308 226 320 220 314 208 M330 236 C324 226 336 220 330 208" stroke={L} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* glasses */}
      <circle cx="66" cy="282" r="16" fill="none" stroke={LINE} strokeWidth="4" />
      <circle cx="108" cy="282" r="16" fill="none" stroke={LINE} strokeWidth="4" />
      <path d="M82 280 Q87 274 92 280" stroke={LINE} strokeWidth="4" fill="none" />
      <circle cx="66" cy="282" r="12" fill={L} opacity="0.25" />
      <circle cx="108" cy="282" r="12" fill={L} opacity="0.25" />
      <Sparkle x={62} y={112} s={0.8} />
    </Frame>
  )
}

/** Contact — an open envelope, a letter on its way and a paper plane */
export function ContactScene() {
  return (
    <Frame label="An open envelope with a letter rising out of it and a paper plane flying away">
      {/* envelope back */}
      <rect x="92" y="170" width="190" height="124" rx="10" fill={D} />
      <path d="M92 178 L187 112 L282 178 Z" fill={D} />
      {/* letter */}
      <g className="il-float">
        <rect x="114" y="112" width="146" height="132" rx="6" fill={P} />
        <rect x="132" y="132" width="70" height="8" rx="4" fill={B} />
        {[152, 166, 180, 194].map((y, i) => (
          <rect key={y} x="132" y={y} width={i === 3 ? 60 : 108} height="6" rx="3" fill={B} opacity="0.45" />
        ))}
        <path d="M222 214 C222 204 236 204 236 214 C236 204 250 204 250 214 C250 226 236 232 236 236 C236 232 222 226 222 214 Z" fill="#ec7448" />
      </g>
      {/* envelope front */}
      <path d="M92 190 L187 248 L282 190 V284 a10 10 0 0 1 -10 10 H102 a10 10 0 0 1 -10 -10 Z" fill={B} />
      <path d="M92 294 L170 236 M282 294 L204 236" stroke={D} strokeWidth="3" opacity="0.35" />
      {/* paper plane + trail */}
      <path d="M150 92 C190 40 250 46 300 70" stroke="var(--tone-line)" strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round" fill="none" />
      <g className="il-float" style={{ animationDelay: '-2s' }}>
        <path d="M300 54 L366 40 L322 96 L314 76 Z" fill={L} />
        <path d="M300 54 L366 40 L314 76 Z" fill={P} />
        <path d="M314 76 L322 96 L330 82 Z" fill={B} />
      </g>
      {/* speech bubble */}
      <g>
        <rect x="300" y="196" width="66" height="40" rx="14" fill={L} />
        <path d="M312 236 L306 250 L324 236 Z" fill={L} />
        <circle cx="320" cy="216" r="4" fill={D} />
        <circle cx="333" cy="216" r="4" fill={D} />
        <circle cx="346" cy="216" r="4" fill={D} />
      </g>
      <Sparkle x={66} y={120} s={0.8} />
    </Frame>
  )
}

const SCENES: Partial<Record<PlanetId, () => JSX.Element>> = {
  sun: SchoolScene,
  mercury: AboutScene,
  earth: CoursesScene,
  mars: ShopScene,
  venus: GalleryScene,
  jupiter: TeamScene,
  saturn: BlogScene,
  uranus: ContactScene,
}

export function hasIllustration(id: PlanetId): boolean {
  return Boolean(SCENES[id])
}

/** The scene for a page, by its planet. Renders nothing if a page has none yet. */
export default function PageIllustration({ planet, className = '' }: { planet: PlanetId; className?: string }) {
  const Scene = SCENES[planet]
  if (!Scene) return null
  return (
    <div className={className}>
      <Scene />
    </div>
  )
}
