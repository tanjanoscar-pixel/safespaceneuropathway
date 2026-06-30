'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import OneNoir from '@/components/OneNoir'
import { createClient } from '@/lib/supabase'
import { ARCHETYPE_META, daysSince, getGreeting, getOneNoirGreeting } from '@/lib/utils'
import { type Profile, type ArchetypeKey } from '@/types/database'

interface DashboardClientProps {
  profile: Profile | null
}

const COMING_SOON_FEATURES = [
  {
    title: 'Mood Log',
    description: '30-second daily check-in. No pressure, no judgment.',
    phase: 'Phase 2',
    icon: '◎',
  },
  {
    title: 'Grounding',
    description: '6 techniques tailored to your archetype.',
    phase: 'Phase 2',
    icon: '⊕',
  },
  {
    title: 'Affirmations',
    description: '120+ affirmations. David-approved. No toxic positivity.',
    phase: 'Phase 2',
    icon: '◇',
  },
  {
    title: 'Crisis Support',
    description: 'Safe words, trusted contacts, real escalation.',
    phase: 'Phase 3',
    icon: '⬡',
  },
]

export default function DashboardClient({ profile }: DashboardClientProps) {
  const router = useRouter()
  const archetypeKey = profile?.archetype_key as ArchetypeKey | null
  const meta = archetypeKey ? ARCHETYPE_META[archetypeKey] : null
  const greeting = getGreeting()
  const name = profile?.display_name || 'there'
  const oneNoirMessage = archetypeKey
    ? getOneNoirGreeting(archetypeKey)
    : 'I see you. You\'re safe here.'
  const daysWithUs = profile?.created_at ? daysSince(profile.created_at) : 0

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="page-container">
      {/* Top nav */}
      <header
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ borderColor: '#1F2937' }}
      >
        <span className="text-lg font-bold tracking-tight">
          ALT<span className="text-teal-500">er</span>Ego
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-text-muted hover:text-white transition-colors duration-200"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        {/* OneNoir greeting section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-8 mb-12"
        >
          <div className="flex-shrink-0">
            <OneNoir
              state="welcoming"
              archetypeKey={archetypeKey}
              size="md"
            />
          </div>

          <div>
            <p className="text-sm text-text-muted mb-1">{greeting}, {name}</p>
            <p
              className="text-xl sm:text-2xl font-medium leading-snug text-white mb-4"
              style={{ color: meta ? meta.color : undefined }}
            >
              &ldquo;{oneNoirMessage}&rdquo;
            </p>
            <p className="text-sm text-text-muted italic">— OneNoir</p>
          </div>
        </motion.div>

        {/* Archetype card */}
        {meta && archetypeKey && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="card mb-8 border-l-4"
            style={{ borderLeftColor: meta.color }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
                  Your Archetype
                </p>
                <h2 className="text-2xl font-bold mb-1" style={{ color: meta.color }}>
                  {meta.name}
                </h2>
                <p className="text-text-secondary text-sm">{meta.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-[200px] justify-end">
                {meta.traits.slice(0, 3).map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${meta.color}15`,
                      color: meta.color,
                      border: `1px solid ${meta.color}35`,
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
        >
          <div className="card text-center">
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: meta?.color ?? '#14B8A6' }}
            >
              {daysWithUs === 0 ? '1' : daysWithUs}
            </p>
            <p className="text-xs text-text-muted">
              {daysWithUs <= 1 ? 'Day' : 'Days'} with us
            </p>
          </div>
          <div className="card text-center">
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: meta?.color ?? '#14B8A6' }}
            >
              1
            </p>
            <p className="text-xs text-text-muted">Archetype found</p>
          </div>
          <div className="card text-center col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold mb-1 text-text-muted opacity-40">—</p>
            <p className="text-xs text-text-muted">Mood streak (Phase 2)</p>
          </div>
        </motion.div>

        {/* Feature tiles (coming soon) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4">
            Coming Next
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMING_SOON_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                className="card flex items-start gap-4 opacity-60 cursor-default select-none"
              >
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white text-sm">
                      {feature.title}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-navy-700 text-text-muted">
                      {feature.phase}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-snug">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prevention Is the Cure */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 1 }}
          className="text-center text-xs text-text-muted mt-12 opacity-50"
        >
          Prevention Is the Cure.{' '}
          <span className="text-teal-500/60">Small steps create big change.</span>
        </motion.p>
      </main>
    </div>
  )
}
