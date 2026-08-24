import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function ObservationsPage() {
  const { childId } = useOutletContext()
  const [observations, setObservations] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('observations')
      .select(
        'id, observed_at, setting, behaviour, child_response, strengths, safeguarding_concern, profiles:user_id (full_name)',
      )
      .eq('child_id', childId)
      .order('observed_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) setError(fetchError.message)
        else setObservations(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [childId])

  if (error) return <p className="platform-form-error">{error}</p>
  if (observations === null) return <p>Loading…</p>
  if (observations.length === 0) {
    return (
      <div className="platform-empty">
        <p>No observations recorded yet.</p>
        <p>Use "Record observation" to add the first factual, everyday observation.</p>
      </div>
    )
  }

  return (
    <ul className="platform-observation-list">
      {observations.map((o) => (
        <li key={o.id} className="platform-observation-item">
          <div className="platform-observation-meta">
            <span>{new Date(o.observed_at).toLocaleString()}</span>
            <span>{o.setting}</span>
            <span>Recorded by {o.profiles?.full_name ?? 'Unknown'}</span>
            {o.safeguarding_concern && <span className="platform-tag-alert">Safeguarding concern flagged</span>}
          </div>
          <p>{o.behaviour}</p>
          {o.child_response && (
            <p>
              <strong>Child's response:</strong> {o.child_response}
            </p>
          )}
          {o.strengths && (
            <p>
              <strong>Strengths shown:</strong> {o.strengths}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
