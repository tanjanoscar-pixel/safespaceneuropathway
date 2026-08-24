import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

const ROLE_OPTIONS = [
  { value: 'senco', label: 'SENCO' },
  { value: 'clinician', label: 'Clinician / health professional' },
  { value: 'la_officer', label: 'Local authority officer' },
  { value: 'nhs_professional', label: 'NHS professional' },
  { value: 'other', label: 'Other' },
]

export function TeamAccessPage() {
  const { childId } = useOutletContext()
  const { user } = useAuth()
  const [links, setLinks] = useState(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('senco')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    supabase
      .from('professional_child_links')
      .select('id, professional_id, role, status, granted_at')
      .eq('child_id', childId)
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message)
        else setLinks(data ?? [])
      })
  }, [childId])

  useEffect(() => {
    load()
  }, [load])

  async function grantAccess(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { data: professionalId, error: lookupError } = await supabase.rpc('find_profile_id_by_email', {
      lookup_email: email.trim(),
    })

    if (lookupError || !professionalId) {
      setSubmitting(false)
      setError('No account was found with that email address.')
      return
    }

    const { error: insertError } = await supabase.from('professional_child_links').insert({
      child_id: childId,
      professional_id: professionalId,
      role,
      granted_by: user.id,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setEmail('')
    load()
  }

  async function revoke(link) {
    const { error: revokeError } = await supabase
      .from('professional_child_links')
      .update({ status: 'revoked', revoked_by: user.id, revoked_at: new Date().toISOString() })
      .eq('id', link.id)
    if (revokeError) {
      setError(revokeError.message)
      return
    }
    load()
  }

  return (
    <div>
      <p className="platform-form-hint">
        Grant access only to people who need it for this child. Being on this list is the only way
        someone other than you can see this child's records.
      </p>

      <form className="platform-form" onSubmit={grantAccess}>
        <label htmlFor="email">Professional's email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="role">Their role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {error && <p className="platform-form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Granting…' : 'Grant access'}
        </button>
      </form>

      <h2>Who has access</h2>
      {links === null && <p>Loading…</p>}
      {links && links.length === 0 && <p>No one else has been granted access yet.</p>}
      {links &&
        links.map((link) => (
          <div key={link.id} className="platform-candidate-card">
            <p>
              <strong>{link.role.replace(/_/g, ' ')}</strong> · status: {link.status}
            </p>
            <p className="platform-card-meta">Granted {new Date(link.granted_at).toLocaleDateString()}</p>
            {link.status === 'active' && (
              <button type="button" onClick={() => revoke(link)}>
                Revoke access
              </button>
            )}
          </div>
        ))}
    </div>
  )
}
