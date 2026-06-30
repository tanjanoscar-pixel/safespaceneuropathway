'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import OneNoir from '@/components/OneNoir'
import { createClient } from '@/lib/supabase'
import { calculateArchetype, ARCHETYPE_META } from '@/lib/utils'
import { type ArchetypeKey } from '@/types/database'

const TRIAGE_QUESTIONS: Array<{
  question: string
  options: Array<{ text: string; archetype: ArchetypeKey }>
}> = [
  {
    question: 'When you\'re struggling, what do you reach for first?',
    options: [
      { text: 'Fight through it alone — I push through', archetype: 'warrior' },
      { text: 'Space to think — I need to understand it first', archetype: 'sage' },
      { text: 'Someone who gets it — I need to feel heard', archetype: 'empath' },
      { text: 'A creative outlet — I need to express it', archetype: 'creator' },
      { text: 'A way to fix things — I want to make it better', archetype: 'healer' },
      { text: 'Something grounding — I need to feel stable', archetype: 'anchor' },
    ],
  },
  {
    question: 'What best describes your greatest strength?',
    options: [
      { text: 'Resilience — I keep getting back up no matter what', archetype: 'warrior' },
      { text: 'Insight — I see patterns others miss', archetype: 'sage' },
      { text: 'Connection — I feel deeply and people know I mean it', archetype: 'empath' },
      { text: 'Expression — I create meaning from chaos', archetype: 'creator' },
      { text: 'Integration — I help others heal because I\'ve been there', archetype: 'healer' },
      { text: 'Steadiness — I\'m the calm in the storm', archetype: 'anchor' },
    ],
  },
  {
    question: 'When your nervous system fires up, you tend to…',
    options: [
      { text: 'Face it head-on — I\'d rather fight than freeze', archetype: 'warrior' },
      { text: 'Retreat and analyse — I need to understand what\'s happening', archetype: 'sage' },
      { text: 'Seek connection — I need someone safe nearby', archetype: 'empath' },
      { text: 'Create something — I need to express what\'s inside', archetype: 'creator' },
      { text: 'Help someone else — it takes me out of my own head', archetype: 'healer' },
      { text: 'Ground myself — body, breath, routine, sensation', archetype: 'anchor' },
    ],
  },
  {
    question: 'Your relationship with vulnerability is…',
    options: [
      { text: 'Something to overcome and grow stronger from', archetype: 'warrior' },
      { text: 'Data — I examine it to understand myself better', archetype: 'sage' },
      { text: 'A bridge to real connection with others', archetype: 'empath' },
      { text: 'Raw material — I transform it into something', archetype: 'creator' },
      { text: 'A teacher — it shows me where healing is needed', archetype: 'healer' },
      { text: 'Something to sit with steadily, without panic', archetype: 'anchor' },
    ],
  },
  {
    question: 'What do you most need when things are really dark?',
    options: [
      { text: 'Someone to believe in my ability to survive this', archetype: 'warrior' },
      { text: 'Space to figure it out without being rushed', archetype: 'sage' },
      { text: 'To feel truly understood, not fixed or advised', archetype: 'empath' },
      { text: 'Permission to feel everything, no filter', archetype: 'creator' },
      { text: 'A sense of purpose — to be useful to someone', archetype: 'healer' },
      { text: 'Routine, safety, something I can count on', archetype: 'anchor' },
    ],
  },
  {
    question: 'How do you process difficult emotions?',
    options: [
      { text: 'I push through them until I\'m past them', archetype: 'warrior' },
      { text: 'I journal, analyse, and try to understand them', archetype: 'sage' },
      { text: 'I talk them through with someone I trust', archetype: 'empath' },
      { text: 'I express them — music, writing, art, movement', archetype: 'creator' },
      { text: 'I work through them by focusing on helping others', archetype: 'healer' },
      { text: 'I wait them out with grounding practices and routine', archetype: 'anchor' },
    ],
  },
  {
    question: 'Your biggest challenge tends to be…',
    options: [
      { text: 'Knowing when to rest instead of push harder', archetype: 'warrior' },
      { text: 'Getting out of my head and into my body', archetype: 'sage' },
      { text: 'Setting limits on how much I give to others', archetype: 'empath' },
      { text: 'Following through once the initial spark fades', archetype: 'creator' },
      { text: 'Putting my own needs first for once', archetype: 'healer' },
      { text: 'Tolerating uncertainty and things I can\'t control', archetype: 'anchor' },
    ],
  },
  {
    question: 'People come to you when they need…',
    options: [
      { text: 'Direct truth and the courage to face hard things', archetype: 'warrior' },
      { text: 'Perspective, wisdom, a different way of seeing', archetype: 'sage' },
      { text: 'To feel heard, seen, and not alone', archetype: 'empath' },
      { text: 'Fresh ideas or a creative approach to their problem', archetype: 'creator' },
      { text: 'Someone who\'s been through it and came back', archetype: 'healer' },
      { text: 'Calm, steadiness, someone who won\'t panic', archetype: 'anchor' },
    ],
  },
  {
    question: 'Which phrase lands closest to your core truth?',
    options: [
      { text: '"I survived. I will survive this too."', archetype: 'warrior' },
      { text: '"Understanding is the beginning of everything."', archetype: 'sage' },
      { text: '"You are not alone in this. Not ever."', archetype: 'empath' },
      { text: '"Pain can become something that matters."', archetype: 'creator' },
      { text: '"Healing is possible. I am living proof."', archetype: 'healer' },
      { text: '"Small, steady steps. That is how we get there."', archetype: 'anchor' },
    ],
  },
  {
    question: 'When you imagine your best self, they are…',
    options: [
      { text: 'Unbreakable — and wise enough to know their limits', archetype: 'warrior' },
      { text: 'Clear, calm, and deeply knowing', archetype: 'sage' },
      { text: 'Deeply connected and emotionally free', archetype: 'empath' },
      { text: 'Making something that actually matters', archetype: 'creator' },
      { text: 'A light for others who are still in the dark', archetype: 'healer' },
      { text: 'The root that keeps others standing in the storm', archetype: 'anchor' },
    ],
  },
]

type Phase = 'quiz' | 'reveal'

export default function ArchetypePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<ArchetypeKey[]>([])
  const [selectedOption, setSelectedOption] = useState<ArchetypeKey | null>(null)
  const [result, setResult] = useState<{ key: ArchetypeKey; scores: Record<ArchetypeKey, number> } | null>(null)
  const [saving, setSaving] = useState(false)

  const total = TRIAGE_QUESTIONS.length
  const progress = ((currentQuestion) / total) * 100

  function handleSelect(archetype: ArchetypeKey) {
    setSelectedOption(archetype)
  }

  async function handleNext() {
    if (!selectedOption) return

    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentQuestion + 1 < total) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      const calc = calculateArchetype(newAnswers)
      setResult(calc)
      setSaving(true)

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          await supabase
            .from('profiles')
            .update({
              archetype_key: calc.key,
              archetype_scores: calc.scores,
              onboarding_completed: true,
            })
            .eq('id', user.id)

          // Log to audit
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            action: 'archetype_assigned',
            table_name: 'profiles',
            metadata: { archetype_key: calc.key, scores: calc.scores },
          })
        }
      } catch {
        // Non-blocking — show reveal regardless
      } finally {
        setSaving(false)
        setPhase('reveal')
      }
    }
  }

  if (phase === 'reveal' && result) {
    const meta = ARCHETYPE_META[result.key]

    return (
      <div className="page-container items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="max-w-lg w-full"
        >
          {/* OneNoir in welcoming state with archetype color */}
          <div className="flex justify-center mb-8">
            <OneNoir state="welcoming" archetypeKey={result.key} size="lg" />
          </div>

          {/* Archetype name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-widest text-text-muted mb-2">
              Your archetype
            </p>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: meta.color }}
            >
              {meta.name}
            </h1>
            <p className="text-lg text-text-secondary mb-6">{meta.tagline}</p>

            {/* Traits */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {meta.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1 rounded-full text-sm font-medium border"
                  style={{
                    borderColor: `${meta.color}40`,
                    color: meta.color,
                    background: `${meta.color}12`,
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Enter dashboard */}
            <motion.button
              onClick={() => router.push('/dashboard')}
              disabled={saving}
              className="btn-primary text-base px-8 py-4 disabled:opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {saving ? 'Saving…' : 'Enter Your Space →'}
            </motion.button>

          </motion.div>
        </motion.div>
      </div>
    )
  }

  const question = TRIAGE_QUESTIONS[currentQuestion]

  return (
    <div className="page-container">
      {/* Progress bar */}
      <div
        className="h-1 transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #14B8A6, #06B6D4)',
        }}
        role="progressbar"
        aria-valuenow={currentQuestion}
        aria-valuemax={total}
        aria-label={`Question ${currentQuestion + 1} of ${total}`}
      />

      <div className="flex flex-col items-center flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-10">
          <span className="text-sm text-text-muted">
            {currentQuestion + 1} / {total}
          </span>
          <span className="text-sm font-semibold tracking-tight">
            ALT<span className="text-teal-500">er</span>Ego
          </span>
          <div className="w-12" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-8 text-center leading-snug">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedOption === option.archetype
                return (
                  <button
                    key={option.archetype}
                    onClick={() => handleSelect(option.archetype)}
                    className={[
                      'w-full text-left px-5 py-4 rounded-xl border transition-all duration-200',
                      'text-sm sm:text-base leading-snug min-h-[56px]',
                      isSelected
                        ? 'border-teal-500 bg-teal-500/12 text-white'
                        : 'border-navy-750 bg-navy-800 text-text-secondary hover:border-teal-500/50 hover:text-white hover:bg-teal-500/06',
                    ].join(' ')}
                    aria-pressed={isSelected}
                  >
                    {option.text}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <div className="mt-8 w-full">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentQuestion + 1 === total ? 'See My Archetype' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
