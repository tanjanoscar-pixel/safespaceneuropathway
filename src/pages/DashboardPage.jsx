import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

export function DashboardPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState(null)
  const [error, setError] = useState(null)
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChild, setNewChild] = useState({ first_name: '', last_name: '', date_of_birth: '' })
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const [ownedResult, linkedResult] = await Promise.all([
      supabase.from('children').select('id, first_name, last_name').eq('user_id', user.id),
      supabase
        .from('professional_child_links')
        .select('role, status, children:child_id (id, first_name, last_name)')
        .eq('professional_id', user.id)
        .eq('status', 'active'),
    ])

    if (ownedResult.error) {
      setError(ownedResult.error.message)
      return
    }
    if (linkedResult.error) {
      setError(linkedResult.error.message)
      return
    }

    const owned = (ownedResult.data ?? []).map((c) => ({
      child: c,
      accessLabel: 'Parent / carer (your child)',
    }))
    const linked = (linkedResult.data ?? [])
      .filter((rel) => rel.children)
      .map((rel) => ({
        child: rel.children,
        accessLabel: `Authorised professional (${rel.role.replace(/_/g, ' ')})`,
      }))

    setChildren([...owned, ...linked])
  }, [user])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  async function handleAddChild(e) {
    e.preventDefault()
    setError(null)
    if (!newChild.first_name) {
      setError('First name is required.')
      return
    }
    setCreating(true)
    const { error: insertError } = await supabase.from('children').insert({
      user_id: user.id,
      first_name: newChild.first_name,
      last_name: newChild.last_name || null,
      date_of_birth: newChild.date_of_birth || null,
    })
    setCreating(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewChild({ first_name: '', last_name: '', date_of_birth: '' })
    setShowAddChild(false)
    load()
  }

  return (
    <div className="platform-page">
      <h1>Your children and cases</h1>
      <p className="platform-page-intro">
        You only see the children you have been explicitly authorised to access. Being connected to a
        child does not automatically grant access to every record about them.
      </p>

      {error && <p className="platform-form-error">{error}</p>}

      {!showAddChild && (
        <button type="button" onClick={() => setShowAddChild(true)}>
          Add a child
        </button>
      )}

      {showAddChild && (
        <form className="platform-form" onSubmit={handleAddChild}>
          <label htmlFor="first_name">First name *</label>
          <input
            id="first_name"
            value={newChild.first_name}
            onChange={(e) => setNewChild((c) => ({ ...c, first_name: e.target.value }))}
            required
          />
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            value={newChild.last_name}
            onChange={(e) => setNewChild((c) => ({ ...c, last_name: e.target.value }))}
          />
          <label htmlFor="date_of_birth">Date of birth</label>
          <input
            id="date_of_birth"
            type="date"
            value={newChild.date_of_birth}
            onChange={(e) => setNewChild((c) => ({ ...c, date_of_birth: e.target.value }))}
          />
          <div className="platform-form-row">
            <button type="submit" disabled={creating}>
              {creating ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowAddChild(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {children === null && !error && <p>Loading…</p>}

      {children && children.length === 0 && (
        <div className="platform-empty">
          <p>No children or cases are currently linked to your account.</p>
          <p>
            Parents and carers can add a child above. Teachers and other professionals need to be
            authorised by a parent or administrator before a child appears here.
          </p>
        </div>
      )}

      {children && children.length > 0 && (
        <div className="platform-card-grid">
          {children.map(({ child, accessLabel }) => (
            <Link key={child.id} to={`/app/children/${child.id}`} className="platform-card">
              <h2>
                {child.first_name} {child.last_name ?? ''}
              </h2>
              <p className="platform-card-meta">{accessLabel}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
