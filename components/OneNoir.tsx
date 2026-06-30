'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { type ArchetypeKey } from '@/types/database'
import { ARCHETYPE_META } from '@/lib/utils'

export type OneNoirState = 'intro' | 'calm' | 'alert' | 'welcoming'

interface OneNoirProps {
  state?: OneNoirState
  archetypeKey?: ArchetypeKey | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-32 h-44',
  md: 'w-48 h-64',
  lg: 'w-64 h-88',
}

// Neural pathway SVG path definitions radiating from head (center ~100,80)
const NEURAL_PATHS = [
  { d: 'M95,50 Q70,20 40,8',     delay: 0 },
  { d: 'M105,50 Q130,20 160,8',  delay: 0.4 },
  { d: 'M80,62 Q50,50 20,48',    delay: 0.8 },
  { d: 'M120,62 Q150,50 180,48', delay: 1.2 },
  { d: 'M88,52 Q75,28 85,5',     delay: 0.2 },
  { d: 'M112,52 Q125,28 115,5',  delay: 0.6 },
  { d: 'M90,44 Q88,18 100,-2',   delay: 1.0 },
  { d: 'M75,68 Q45,72 18,78',    delay: 1.4 },
  { d: 'M125,68 Q155,72 182,78', delay: 0.9 },
]

// Animation variants per state
const BODY_VARIANTS = {
  intro: {
    scaleY: [1, 1.018, 1],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
  calm: {
    scaleY: [1, 1.012, 1],
    transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
  },
  alert: {
    scaleY: [1, 1.025, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  welcoming: {
    scaleY: [1, 1.015, 1],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
}

const NEURAL_OPACITY = {
  intro:     { min: 0.15, max: 0.75, duration: 3.5 },
  calm:      { min: 0.1,  max: 0.5,  duration: 5 },
  alert:     { min: 0.3,  max: 0.95, duration: 2.5 },
  welcoming: { min: 0.2,  max: 0.85, duration: 4 },
}

const EYE_VARIANTS = {
  intro:     { scaleY: [1, 1.15, 1], opacity: [0.8, 1, 0.8], duration: 4 },
  calm:      { scaleY: [1, 1.08, 1], opacity: [0.7, 0.9, 0.7], duration: 6 },
  alert:     { scaleY: [1, 1.25, 1], opacity: [0.9, 1, 0.9], duration: 2.5 },
  welcoming: { scaleY: [1, 1.2, 1],  opacity: [0.85, 1, 0.85], duration: 3.5 },
}

export default function OneNoir({
  state = 'calm',
  archetypeKey,
  size = 'md',
  className = '',
}: OneNoirProps) {
  const controls = useAnimation()

  const glowColor = archetypeKey
    ? ARCHETYPE_META[archetypeKey].color
    : '#14B8A6'

  const bodyColor = '#0E111A'
  const outlineColor = glowColor

  const neuralConfig = NEURAL_OPACITY[state]
  const eyeConfig = EYE_VARIANTS[state]
  const bodyAnim = BODY_VARIANTS[state]

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])

  return (
    <motion.div
      className={`relative ${SIZE_MAP[size]} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="OneNoir — your AI guide"
        role="img"
      >
        {/* Ambient background glow */}
        <motion.ellipse
          cx="100" cy="160"
          rx="60" ry="80"
          fill={glowColor}
          opacity={0}
          animate={{ opacity: [0, 0.06, 0] }}
          transition={{
            duration: neuralConfig.duration * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Neural pathways */}
        <g>
          {NEURAL_PATHS.map((path, i) => (
            <motion.path
              key={i}
              d={path.d}
              className="neural-path"
              stroke={glowColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              filter={`drop-shadow(0 0 3px ${glowColor})`}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [
                  neuralConfig.min,
                  neuralConfig.max,
                  neuralConfig.min,
                ],
                pathLength: [0.4, 1, 0.4],
              }}
              transition={{
                duration: neuralConfig.duration,
                delay: path.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </g>

        {/* Body silhouette (animated breathe) */}
        <motion.g
          style={{ originX: '100px', originY: '200px' }}
          animate={bodyAnim}
        >
          {/* Head */}
          <ellipse
            cx="100" cy="78"
            rx="34" ry="38"
            fill={bodyColor}
            stroke={outlineColor}
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />

          {/* Neck */}
          <rect
            x="90" y="113"
            width="20" height="16"
            fill={bodyColor}
          />

          {/* Upper body / cape flowing down */}
          <path
            d={[
              'M64,126',
              'Q42,132 32,152',
              'Q22,175 28,210',
              'Q30,240 35,270',
              'L50,268',
              'Q46,238 47,210',
              'Q50,185 60,170',
              'L68,155 L72,128',
              'Z',
            ].join(' ')}
            fill={bodyColor}
          />
          <path
            d={[
              'M136,126',
              'Q158,132 168,152',
              'Q178,175 172,210',
              'Q170,240 165,270',
              'L150,268',
              'Q154,238 153,210',
              'Q150,185 140,170',
              'L132,155 L128,128',
              'Z',
            ].join(' ')}
            fill={bodyColor}
          />

          {/* Central torso */}
          <path
            d={[
              'M72,128',
              'L68,155 L65,178',
              'L70,215 L75,268',
              'L90,268 L92,220',
              'L100,210',
              'L108,220 L110,268',
              'L125,268 L130,215',
              'L135,178 L132,155',
              'L128,128',
              'Q114,122 100,121',
              'Q86,122 72,128',
              'Z',
            ].join(' ')}
            fill={bodyColor}
            stroke={outlineColor}
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
        </motion.g>

        {/* Eyes — animated glow */}
        <motion.g>
          {/* Left eye outer */}
          <motion.ellipse
            cx="87" cy="74"
            rx="6" ry="8"
            fill="white"
            opacity={0.9}
            animate={{
              scaleY: eyeConfig.scaleY,
              opacity: eyeConfig.opacity,
            }}
            transition={{
              duration: eyeConfig.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Left eye inner glow */}
          <motion.ellipse
            cx="87" cy="74"
            rx="3.5" ry="5"
            fill={glowColor}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: eyeConfig.duration * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
            style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
          />

          {/* Right eye outer */}
          <motion.ellipse
            cx="113" cy="74"
            rx="6" ry="8"
            fill="white"
            opacity={0.9}
            animate={{
              scaleY: eyeConfig.scaleY,
              opacity: eyeConfig.opacity,
            }}
            transition={{
              duration: eyeConfig.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.1,
            }}
          />
          {/* Right eye inner glow */}
          <motion.ellipse
            cx="113" cy="74"
            rx="3.5" ry="5"
            fill={glowColor}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: eyeConfig.duration * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
          />
        </motion.g>

        {/* Easter egg: Binary "Find your divine" — tiny, discoverable */}
        <text
          x="8"
          y="312"
          fontSize="3.2"
          fill={glowColor}
          opacity="0.18"
          fontFamily="monospace"
          letterSpacing="1"
          aria-hidden="true"
        >
          01000110 01101001 01101110 01100100 00100000 01111001 01101111 01110101 01110010 00100000 01100100 01101001 01110110 01101001 01101110 01100101
        </text>
      </svg>
    </motion.div>
  )
}
