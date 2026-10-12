'use client'

import './eco-penguin.css'

export type EcoMood = 'idle' | 'wave' | 'talk' | 'point' | 'cheer'

type Props = {
  mood?: EcoMood
  /** Mouth moves while true, on top of any mood. */
  speaking?: boolean
  /** Rotation of the right flipper when pointing (degrees, negative = toward the right). */
  pointAngle?: number
  /** Gentle curious head tilt, used when Eco is explaining something. */
  tilting?: boolean
  size?: number
  className?: string
  title?: string
}

const POSE: Record<EcoMood, { left: number; right: number; head: number }> = {
  idle: { left: 12, right: -12, head: 0 },
  wave: { left: 12, right: -148, head: -3 },
  talk: { left: 12, right: -12, head: 0 },
  point: { left: 12, right: -90, head: 3 },
  cheer: { left: 146, right: -146, head: 0 },
}

const SPARK = 'M0-10L3-3L10 0L3 3L0 10L-3 3L-10 0L-3-3Z'

/**
 * Eco, the Eco Penguin guide. Inline SVG so the CSS animations apply
 * (breathing, blinking, wave, talk, cheer). Respects prefers-reduced-motion in the stylesheet.
 */
export default function EcoPenguin({
  mood = 'idle',
  speaking = false,
  pointAngle,
  tilting = false,
  size = 160,
  className = '',
  title = 'Eco the penguin',
}: Props) {
  const pose = POSE[mood]
  const right = mood === 'point' && typeof pointAngle === 'number' ? pointAngle : pose.right
  const happy = mood === 'cheer'
  const classes = [
    'penguin',
    `penguin--${mood}`,
    speaking ? 'is-talking' : '',
    tilting ? 'is-tilting' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const lookX = mood === 'point' ? 3 : 0

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 280"
      width={size}
      height={(size * 280) / 240}
      role="img"
      aria-label={title}
      className={classes}
    >
      <title>{title}</title>
      <ellipse className="pg-shadow p-shadow" cx="120" cy="266" rx="62" ry="8" />
      <g className="p-figure">
        <g className="p-torso">
          <g>
            <ellipse className="pg-foot" cx="91" cy="249" rx="22" ry="11" />
            <ellipse className="pg-foot" cx="149" cy="249" rx="22" ry="11" />
          </g>
          <path
            className="pg-body"
            d="M120 46C152 46 176 76 180 120C186 190 164 248 120 248C76 248 54 190 60 120C64 76 88 46 120 46Z"
          />
          <path
            className="pg-rim"
            d="M66 150C60 190 82 244 120 244M174 150C180 190 158 244 120 244"
          />
          <ellipse
            className="pg-sheen"
            cx="90"
            cy="78"
            rx="20"
            ry="9"
            transform="rotate(-28 90 78)"
            opacity=".8"
          />
          <ellipse className="pg-belly" cx="120" cy="201" rx="40" ry="47" />
          <g className="p-scarf">
            <path className="pg-scarf" d="M62 142Q120 170 178 142L180 158Q120 188 60 158Z" />
            <path className="pg-scarf" d="M138 168L166 161L171 204Q157 212 144 207Z" />
            <path className="pg-scarf2" d="M146 194L170 189L171 204Q157 212 144 207Z" />
          </g>
          <g className="p-flipper-left" transform={`rotate(${pose.left} 63 150)`}>
            <g className="p-flip">
              <ellipse className="pg-flip" cx="63" cy="177" rx="13" ry="29" />
            </g>
          </g>
          <g className="p-flipper-right" transform={`rotate(${right} 177 150)`}>
            <g className="p-flip">
              <ellipse className="pg-flip" cx="177" cy="177" rx="13" ry="29" />
            </g>
          </g>
          <g transform={`rotate(${pose.head} 120 140)`}>
            <g className="p-head">
              <ellipse className="pg-cheek" cx="71" cy="128" rx="10" ry="7" />
              <ellipse className="pg-cheek" cx="169" cy="128" rx="10" ry="7" />
              {happy ? (
                <g className="p-eyes">
                  <path className="pg-arc" d="M80 108Q93 91 106 108" />
                  <path className="pg-arc" d="M134 108Q147 91 160 108" />
                </g>
              ) : (
                <>
                  <g className="p-eyes">
                    <circle className="pg-eye" cx="93" cy="104" r="16" />
                    <circle className="pg-pupil" cx={94 + lookX} cy="106" r="10" />
                    <circle className="pg-eye" cx={97 + lookX} cy="101" r="4.2" />
                    <circle className="pg-eye" cx={90 + lookX} cy="110" r="2.2" />
                    <circle className="pg-eye" cx="147" cy="104" r="16" />
                    <circle className="pg-pupil" cx={148 + lookX} cy="106" r="10" />
                    <circle className="pg-eye" cx={151 + lookX} cy="101" r="4.2" />
                    <circle className="pg-eye" cx={144 + lookX} cy="110" r="2.2" />
                  </g>
                  <g className="p-eyelids">
                    <circle className="pg-lid p-lid" cx="93" cy="104" r="17.4" />
                    <circle className="pg-lid p-lid" cx="147" cy="104" r="17.4" />
                  </g>
                </>
              )}
              <g className="p-mouth">
                <g className="p-mouth-open" opacity={happy ? 1 : 0}>
                  <ellipse className="pg-mouth" cx="120" cy="141" rx="11.5" ry="10" />
                  <path className="pg-foot" d="M108 145Q120 148 132 145Q131 156 120 156Q109 156 108 145Z" />
                </g>
                <g className="p-mouth-closed" opacity={happy ? 0 : 1}>
                  <path className="pg-foot" d="M108 136Q120 139 132 136Q131 147 120 147Q109 147 108 136Z" />
                </g>
              </g>
              <path
                className="pg-gold p-beak-top"
                d="M104 130Q120 117 136 130Q136 139 120 140Q104 139 104 130Z"
              />
            </g>
          </g>
        </g>
      </g>
      {happy && (
        <g aria-hidden>
          <path className="pg-gold p-spark" transform="translate(30 70)" d={SPARK} />
          <path className="pg-ice p-spark p-spark2" transform="translate(212 56)" d={SPARK} />
          <path className="pg-gold p-spark p-spark3" transform="translate(200 120)" d={SPARK} />
        </g>
      )}
    </svg>
  )
}
