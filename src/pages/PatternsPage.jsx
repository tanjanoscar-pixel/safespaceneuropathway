import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'
import { detectPatterns } from '../lib/patternEngine'

const CONFIDENCE_SCORE = { low: 0.3, medium: 0.6, high: 0.85 }

export function PatternsPage() {
  const { childId } = useOutletContext()
  const { user } = useAuth()
  const [patterns, setPatterns] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)

  const loadPatterns = useCallback(async () => {
    const { data: patternRows, error: patternError } = await supabase
      .from('ai_patterns')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (patternError) {
      setError(patternError.message)
      return
    }

    const ids = (patternRows ?? []).map((p) => p.id)
    let reviewsByPattern = {}
    if (ids.length > 0) {
      const { data: reviewRows, error: reviewError } = await supabase
        .from('human_reviews')
        .select('*')
        .eq('reviewable_type', 'ai_pattern')
        .in('reviewable_id', ids)
        .order('reviewed_at', { ascending: true })
      if (reviewError) {
        setError(reviewError.message)
        return
      }
      reviewsByPattern = (reviewRows ?? []).reduce((acc, r) => {
        acc[r.reviewable_id] = [...(acc[r.reviewable_id] ?? []), r]
        return acc
      }, {})
    }

    setPatterns((patternRows ?? []).map((p) => ({ ...p, human_reviews: reviewsByPattern[p.id] ?? [] })))
  }, [childId])

  useEffect(() => {
    loadPatterns()
  }, [loadPatterns])

  async function scanForPatterns() {
    setScanning(true)
    setError(null)
    const { data: observations, error: obsError } = await supabase
      .from('observations')
      .select('id, observed_at, setting, antecedent, behaviour, environmental_factors, follow_up_action')
      .eq('child_id', childId)
      .order('observed_at', { ascending: false })
      .limit(50)
    setScanning(false)
    if (obsError) {
      setError(obsError.message)
      return
    }
    const detected = detectPatterns(
      observations.map((o) => ({ ...o, observation: o.behaviour })),
    )
    const withDates = detected.map((c) => {
      const dates = observations
        .filter((o) => c.supporting_observation_ids.includes(o.id))
        .map((o) => o.observed_at)
      return {
        ...c,
        first_observed: dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null,
        last_observed: dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null,
      }
    })
    setCandidates(withDates)
  }

  async function saveCandidate(candidate) {
    const { error: insertError } = await supabase.from('ai_patterns').insert({
      child_id: childId,
      domain: candidate.dimension,
      pattern_name: `${candidate.dimension.replace(/_/g, ' ')} pattern`,
      description: candidate.description,
      confidence_score: CONFIDENCE_SCORE[candidate.confidence],
      evidence_count: candidate.supporting_observation_ids.length,
      supporting_observation_ids: candidate.supporting_observation_ids,
      first_observed: candidate.first_observed ? candidate.first_observed.slice(0, 10) : null,
      last_observed: candidate.last_observed ? candidate.last_observed.slice(0, 10) : null,
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setCandidates((c) => c.filter((x) => x !== candidate))
    loadPatterns()
  }

  async function review(pattern, decision, notes, editedDescription) {
    // human_reviews.status is a pre-existing constraint that only allows
    // pending / in_review / approved / rejected / needs_edit. The brief's
    // accept/edit/reject/request-more-info actions map onto those values:
    // "edit" is an approval whose correction is captured in edits_made,
    // and "request more info" maps to needs_edit.
    const statusForDecision = {
      accept: 'approved',
      edit: 'approved',
      reject: 'rejected',
      more_info: 'needs_edit',
    }
    const { error: reviewError } = await supabase.from('human_reviews').insert({
      reviewable_type: 'ai_pattern',
      reviewable_id: pattern.id,
      child_id: childId,
      user_id: user.id,
      reviewer_id: user.id,
      reason: `Review of "${pattern.pattern_name}" pattern suggestion`,
      ai_confidence: pattern.confidence_score,
      status: statusForDecision[decision],
      reviewer_notes: notes || null,
      edits_made: editedDescription ? { description: editedDescription } : null,
      reviewed_at: new Date().toISOString(),
    })
    if (reviewError) {
      setError(reviewError.message)
      return
    }
    loadPatterns()
  }

  return (
    <div>
      <p className="platform-form-hint">
        Patterns shown here are candidates generated from recorded observations. They are never a
        diagnosis or a fact — an authorised person must review each one before it informs any decision.
      </p>

      <button type="button" onClick={scanForPatterns} disabled={scanning}>
        {scanning ? 'Checking…' : 'Check for possible patterns'}
      </button>

      {error && <p className="platform-form-error">{error}</p>}

      {candidates.length > 0 && (
        <div className="platform-candidate-list">
          <h2>New candidates (not yet saved)</h2>
          {candidates.map((c, i) => (
            <div key={i} className="platform-candidate-card">
              <p>
                <strong>{c.dimension.replace(/_/g, ' ')}</strong> · confidence: {c.confidence}
              </p>
              <p>{c.description}</p>
              <button type="button" onClick={() => saveCandidate(c)}>
                Save for review
              </button>
            </div>
          ))}
        </div>
      )}

      <h2>Suggestions</h2>
      {patterns === null && <p>Loading…</p>}
      {patterns && patterns.length === 0 && <p>No pattern suggestions yet.</p>}
      {patterns && patterns.map((p) => <PatternCard key={p.id} pattern={p} onReview={review} />)}
    </div>
  )
}

function PatternCard({ pattern, onReview }) {
  const [notes, setNotes] = useState('')
  const [editedDescription, setEditedDescription] = useState(pattern.description)
  const [editing, setEditing] = useState(false)
  const reviews = pattern.human_reviews ?? []
  const latestReview = reviews[reviews.length - 1]
  const status = latestReview?.status ?? 'pending'

  return (
    <div className="platform-candidate-card">
      <p>
        <strong>{pattern.domain?.replace(/_/g, ' ')}</strong> · confidence:{' '}
        {pattern.confidence_score != null ? Math.round(pattern.confidence_score * 100) + '%' : 'n/a'} · status:{' '}
        {status.replace(/_/g, ' ')}
      </p>
      <p>{pattern.description}</p>
      <p className="platform-card-meta">Based on {pattern.evidence_count ?? 0} observation(s)</p>

      {latestReview && (
        <p className="platform-card-meta">
          Last reviewed: {latestReview.status.replace(/_/g, ' ')}
          {latestReview.reviewer_notes ? ` — "${latestReview.reviewer_notes}"` : ''}
        </p>
      )}

      {(status === 'pending' || status === 'in_review') && (
        <div className="platform-review-actions">
          {editing && (
            <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
          )}
          <textarea
            placeholder="Reviewer notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="platform-form-row">
            <button type="button" onClick={() => onReview(pattern, 'accept', notes)}>
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editing) {
                  setEditing(true)
                  return
                }
                onReview(pattern, 'edit', notes, editedDescription)
              }}
            >
              {editing ? 'Save edit' : 'Edit'}
            </button>
            <button type="button" onClick={() => onReview(pattern, 'reject', notes)}>
              Reject
            </button>
            <button type="button" onClick={() => onReview(pattern, 'more_info', notes)}>
              Request more information
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
