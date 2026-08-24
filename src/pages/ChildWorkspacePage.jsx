import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function ChildWorkspacePage() {
  const { childId } = useParams()
  const [child, setChild] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('children')
      .select('id, first_name, last_name')
      .eq('id', childId)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) setError(fetchError.message)
        else setChild(data)
      })
    return () => {
      cancelled = true
    }
  }, [childId])

  if (error) {
    return (
      <div className="platform-page">
        <p className="platform-form-error">
          You do not have access to this child's record, or it could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="platform-page">
      <h1>{child ? `${child.first_name} ${child.last_name ?? ''}`.trim() : 'Loading…'}</h1>

      <nav className="platform-tabs">
        <NavLink to="" end>
          Observations
        </NavLink>
        <NavLink to="observations/new">Record observation</NavLink>
        <NavLink to="patterns">Patterns</NavLink>
        <NavLink to="support-plan">Support plan</NavLink>
        <NavLink to="evidence-summary">Evidence summary</NavLink>
        <NavLink to="team-access">Team access</NavLink>
      </nav>

      <Outlet context={{ childId }} />
    </div>
  )
}
