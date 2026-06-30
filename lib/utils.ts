import { type ArchetypeKey, type ArchetypeScores } from '@/types/database'

// Archetype display metadata (client-safe, no DB required)
export const ARCHETYPE_META: Record<
  ArchetypeKey,
  { name: string; tagline: string; color: string; colorSecondary: string; traits: string[] }
> = {
  warrior: {
    name: 'The Warrior',
    tagline: 'Strength forged in survival',
    color: '#EF4444',
    colorSecondary: '#DC2626',
    traits: ['Resilient', 'Determined', 'Direct', 'Protective', 'Tenacious'],
  },
  sage: {
    name: 'The Sage',
    tagline: 'Clarity through the chaos',
    color: '#8B5CF6',
    colorSecondary: '#7C3AED',
    traits: ['Insightful', 'Analytical', 'Reflective', 'Perceptive', 'Deliberate'],
  },
  empath: {
    name: 'The Empath',
    tagline: 'Depth is your superpower',
    color: '#06B6D4',
    colorSecondary: '#0891B2',
    traits: ['Sensitive', 'Connected', 'Compassionate', 'Intuitive', 'Authentic'],
  },
  creator: {
    name: 'The Creator',
    tagline: 'Making meaning from pain',
    color: '#F59E0B',
    colorSecondary: '#D97706',
    traits: ['Expressive', 'Innovative', 'Imaginative', 'Adaptive', 'Passionate'],
  },
  healer: {
    name: 'The Healer',
    tagline: 'Integration is your path',
    color: '#10B981',
    colorSecondary: '#059669',
    traits: ['Nurturing', 'Integrative', 'Wise', 'Generous', 'Purposeful'],
  },
  anchor: {
    name: 'The Anchor',
    tagline: 'Steady is a kind of strength',
    color: '#94A3B8',
    colorSecondary: '#64748B',
    traits: ['Grounded', 'Steadfast', 'Reliable', 'Calm', 'Methodical'],
  },
}

// Calculate archetype from answers
export function calculateArchetype(answers: ArchetypeKey[]): {
  key: ArchetypeKey
  scores: ArchetypeScores
} {
  const scores: ArchetypeScores = {
    warrior: 0,
    sage: 0,
    empath: 0,
    creator: 0,
    healer: 0,
    anchor: 0,
  }

  for (const answer of answers) {
    scores[answer]++
  }

  const sorted = (Object.keys(scores) as ArchetypeKey[]).sort(
    (a, b) => scores[b] - scores[a]
  )

  return { key: sorted[0], scores }
}

// Validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('One number')
  return { valid: errors.length === 0, errors }
}

// Formatting
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function daysSince(dateString: string): number {
  const diff = Date.now() - new Date(dateString).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// OneNoir messages per archetype
export const ONENOIR_GREETINGS: Record<ArchetypeKey, string[]> = {
  warrior: [
    'I see your strength. And your exhaustion. Both are real.',
    'You have survived everything that tried to stop you. That is not nothing.',
    'Rest is not retreat. It is how warriors remain warriors.',
  ],
  sage: [
    'Your mind is working. Let it rest in your body for a moment.',
    'You understand more than most. Now feel what you already know.',
    'Clarity comes after stillness, not instead of it.',
  ],
  empath: [
    'You feel the room before you enter it. I see that. I see you.',
    'Your sensitivity is not a flaw to manage. It is a gift to protect.',
    'You are not alone in this. Not ever.',
  ],
  creator: [
    'Everything you have felt is material. Keep making.',
    'Pain can become something that matters. You know this.',
    'Expression is not indulgence. It is how you survive.',
  ],
  healer: [
    'You cannot pour from an empty cup. Fill yours first, today.',
    'You have come back from dark places. You carry a lantern now.',
    'Healing is not linear. Neither are you. Both are okay.',
  ],
  anchor: [
    'Steady is enough. Steady is more than enough.',
    'Small, steady steps. That is how we get there.',
    'You are more stable than you know right now.',
  ],
}

export function getOneNoirGreeting(archetypeKey: ArchetypeKey): string {
  const messages = ONENOIR_GREETINGS[archetypeKey]
  return messages[Math.floor(Math.random() * messages.length)]
}
