import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

const emptyForm = {
  identified_need: '',
  desired_outcome: '',
  agreed_support: '',
  child_view: '',
  responsible_person: '',
  start_date: '',
  review_date: '',
  frequency: '',
}

export function SupportPlanPage() {
  const { childId } = useOutletContext()
  const { user } = useAuth()
  const [plans, setPlans] = useState(null)
  const [people, setPeople] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  const loadPlans = useCallback(async () => {
    const { data: interventionRows, error: fetchError } = await supabase
      .from('interventions')
      .select('*, profiles:responsible_person (full_name)')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    const ids = (interventionRows ?? []).map((p) => p.id)
    let reviewsByPlan = {}
    if (ids.length > 0) {
      const { data: reviewRows, error: reviewError } = await supabase
        .from('intervention_reviews')
        .select('*')
        .in('intervention_id', ids)
        .order('reviewed_at', { ascending: true })
      if (reviewError) {
        setError(reviewError.message)
        return
      }
      reviewsByPlan = (reviewRows ?? []).reduce((acc, r) => {
        acc[r.intervention_id] = [...(acc[r.intervention_id] ?? []), r]
        return acc
      }, {})
    }
    setPlans((interventionRows ?? []).map((p) => ({ ...p, reviews: reviewsByPlan[p.id] ?? [] })))
  }, [childId])

  useEffect(() => {
    loadPlans()

    async function loadPeople() {
      const { data: links } = await supabase
        .from('professional_child_links')
        .select('professional_id, role, profiles:professional_id (full_name)')
        .eq('child_id', childId)
        .eq('status', 'active')
      const { data: child } = await supabase
        .from('children')
        .select('user_id, profiles:user_id (full_name)')
        .eq('id', childId)
        .maybeSingle()

      const list = (links ?? [])
        .filter((l) => l.profiles)
        .map((l) => ({ id: l.professional_id, label: `${l.profiles.full_name} (${l.role})` }))
      if (child?.profiles) {
        list.push({ id: child.user_id, label: `${child.profiles.full_name} (parent/carer)` })
      }
      setPeople(list)
    }
    loadPeople()
  }, [childId, loadPlans])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    if (!form.identified_need || !form.desired_outcome || !form.agreed_support) {
      setError('Identified need, desired outcome and agreed support are required.')
      return
    }
    setCreating(true)
    const { error: insertError } = await supabase.from('interventions').insert({
      child_id: childId,
      user_id: user.id,
      name: form.identified_need,
      description: form.agreed_support,
      desired_outcome: form.desired_outcome,
      child_view: form.child_view || null,
      responsible_person: form.responsible_person || user.id,
      start_date: form.start_date || null,
      review_date: form.review_date || null,
      frequency: form.frequency || null,
    })
    setCreating(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setForm(emptyForm)
    loadPlans()
  }

  async function addReview(plan, decision, fields) {
    const { error: reviewError } = await supabase.from('intervention_reviews').insert({
      intervention_id: plan.id,
      reviewed_by: user.id,
      decision,
      evidence_of_delivery: fields.evidence_of_delivery || null,
      outcome: fields.outcome || null,
      child_family_feedback: fields.child_family_feedback || null,
    })
    if (reviewError) {
      setError(reviewError.message)
      return
    }
    if (decision !== 'continue') {
      await supabase
        .from('interventions')
        .update({ status: decision === 'stop' ? 'stopped' : 'changed' })
        .eq('id', plan.id)
    }
    loadPlans()
  }

  return (
    <div>
      <form className="platform-form" onSubmit={handleCreate}>
        <h2>New support plan</h2>

        <label htmlFor="identified_need">Identified need *</label>
        <input id="identified_need" value={form.identified_need} onChange={(e) => update('identified_need', e.target.value)} required />

        <label htmlFor="child_view">Child's view</label>
        <textarea id="child_view" value={form.child_view} onChange={(e) => update('child_view', e.target.value)} />

        <label htmlFor="desired_outcome">Desired outcome *</label>
        <textarea id="desired_outcome" value={form.desired_outcome} onChange={(e) => update('desired_outcome', e.target.value)} required />

        <label htmlFor="agreed_support">Agreed adjustment or support *</label>
        <textarea id="agreed_support" value={form.agreed_support} onChange={(e) => update('agreed_support', e.target.value)} required />

        <label htmlFor="responsible_person">Responsible person</label>
        <select id="responsible_person" value={form.responsible_person} onChange={(e) => update('responsible_person', e.target.value)}>
          <option value="">Me</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="platform-form-row">
          <div>
            <label htmlFor="start_date">Start date</label>
            <input id="start_date" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
          </div>
          <div>
            <label htmlFor="review_date">Review date</label>
            <input id="review_date" type="date" value={form.review_date} onChange={(e) => update('review_date', e.target.value)} />
          </div>
        </div>

        <label htmlFor="frequency">Frequency</label>
        <input id="frequency" value={form.frequency} onChange={(e) => update('frequency', e.target.value)} placeholder="e.g. Daily, twice weekly" />

        {error && <p className="platform-form-error">{error}</p>}

        <button type="submit" disabled={creating}>
          {creating ? 'Saving…' : 'Create support plan'}
        </button>
      </form>

      <h2>Existing support plans</h2>
      {plans === null && <p>Loading…</p>}
      {plans && plans.length === 0 && <p>No support plans yet.</p>}
      {plans &&
        plans.map((plan) => <SupportPlanCard key={plan.id} plan={plan} onReview={addReview} />)}
    </div>
  )
}

function SupportPlanCard({ plan, onReview }) {
  const [fields, setFields] = useState({ evidence_of_delivery: '', outcome: '', child_family_feedback: '' })

  return (
    <div className="platform-candidate-card">
      <p>
        <strong>{plan.name}</strong> · status: {plan.status} · responsible: {plan.profiles?.full_name ?? 'Not set'}
      </p>
      <p>
        <strong>Desired outcome:</strong> {plan.desired_outcome}
      </p>
      <p>
        <strong>Agreed support:</strong> {plan.description}
      </p>
      {plan.child_view && (
        <p>
          <strong>Child's view:</strong> {plan.child_view}
        </p>
      )}
      <p className="platform-card-meta">
        Start: {plan.start_date ?? '—'} · Review due: {plan.review_date ?? '—'} · Frequency: {plan.frequency ?? '—'}
      </p>

      {plan.reviews.length > 0 && (
        <div>
          <strong>Review history</strong>
          <ul>
            {plan.reviews.map((r) => (
              <li key={r.id}>
                {new Date(r.reviewed_at).toLocaleDateString()} — {r.decision}
                {r.outcome ? `: ${r.outcome}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.status === 'active' && (
        <div className="platform-review-actions">
          <textarea
            placeholder="Evidence of delivery"
            value={fields.evidence_of_delivery}
            onChange={(e) => setFields((f) => ({ ...f, evidence_of_delivery: e.target.value }))}
          />
          <textarea
            placeholder="Outcome"
            value={fields.outcome}
            onChange={(e) => setFields((f) => ({ ...f, outcome: e.target.value }))}
          />
          <textarea
            placeholder="Child and family feedback"
            value={fields.child_family_feedback}
            onChange={(e) => setFields((f) => ({ ...f, child_family_feedback: e.target.value }))}
          />
          <div className="platform-form-row">
            <button type="button" onClick={() => onReview(plan, 'continue', fields)}>
              Continue
            </button>
            <button type="button" onClick={() => onReview(plan, 'change', fields)}>
              Change
            </button>
            <button type="button" onClick={() => onReview(plan, 'stop', fields)}>
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
