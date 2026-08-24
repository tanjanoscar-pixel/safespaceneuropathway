import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

const initialForm = {
  observed_at: '',
  setting: '',
  antecedent: '',
  behaviour: '',
  child_response: '',
  support_provided: '',
  what_helped: '',
  what_did_not_help: '',
  strengths: '',
  child_words: '',
  duration_minutes: '',
  frequency: '',
  environmental_factors: '',
  follow_up_action: '',
  safeguarding_concern: false,
  safeguarding_notes: '',
}

export function NewObservationPage() {
  const { childId } = useOutletContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.observed_at || !form.setting || !form.behaviour) {
      setError('Date/time, setting and what was observed are required.')
      return
    }
    setSubmitting(true)
    const { error: insertError } = await supabase.from('observations').insert({
      child_id: childId,
      user_id: user.id,
      observed_at: new Date(form.observed_at).toISOString(),
      setting: form.setting,
      antecedent: form.antecedent || null,
      behaviour: form.behaviour,
      child_response: form.child_response || null,
      support_provided: form.support_provided || null,
      what_helped: form.what_helped || null,
      what_did_not_help: form.what_did_not_help || null,
      strengths: form.strengths || null,
      child_words: form.child_words || null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      frequency: form.frequency || null,
      environmental_factors: form.environmental_factors || null,
      follow_up_action: form.follow_up_action || null,
      safeguarding_concern: form.safeguarding_concern,
      safeguarding_notes: form.safeguarding_concern ? form.safeguarding_notes || null : null,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    navigate('..', { relative: 'path' })
  }

  return (
    <form className="platform-form" onSubmit={handleSubmit}>
      <p className="platform-form-hint">
        Describe what you observed factually. Avoid labels or assumptions — describe what happened, not
        what you think it means.
      </p>

      <label htmlFor="observed_at">Date and time *</label>
      <input
        id="observed_at"
        type="datetime-local"
        value={form.observed_at}
        onChange={(e) => update('observed_at', e.target.value)}
        required
      />

      <label htmlFor="setting">Setting *</label>
      <input
        id="setting"
        type="text"
        placeholder="e.g. Classroom, home, playground"
        value={form.setting}
        onChange={(e) => update('setting', e.target.value)}
        required
      />

      <label htmlFor="antecedent">What happened before</label>
      <textarea id="antecedent" value={form.antecedent} onChange={(e) => update('antecedent', e.target.value)} />

      <label htmlFor="behaviour">What was observed *</label>
      <textarea id="behaviour" value={form.behaviour} onChange={(e) => update('behaviour', e.target.value)} required />

      <label htmlFor="child_response">The child's response</label>
      <textarea id="child_response" value={form.child_response} onChange={(e) => update('child_response', e.target.value)} />

      <label htmlFor="support_provided">Support attempted</label>
      <textarea id="support_provided" value={form.support_provided} onChange={(e) => update('support_provided', e.target.value)} />

      <label htmlFor="what_helped">What helped</label>
      <textarea id="what_helped" value={form.what_helped} onChange={(e) => update('what_helped', e.target.value)} />

      <label htmlFor="what_did_not_help">What did not help</label>
      <textarea id="what_did_not_help" value={form.what_did_not_help} onChange={(e) => update('what_did_not_help', e.target.value)} />

      <label htmlFor="strengths">Strengths demonstrated</label>
      <textarea id="strengths" value={form.strengths} onChange={(e) => update('strengths', e.target.value)} />

      <label htmlFor="child_words">The child's own words (if available)</label>
      <textarea id="child_words" value={form.child_words} onChange={(e) => update('child_words', e.target.value)} />

      <div className="platform-form-row">
        <div>
          <label htmlFor="duration_minutes">Duration (minutes)</label>
          <input
            id="duration_minutes"
            type="number"
            min="0"
            value={form.duration_minutes}
            onChange={(e) => update('duration_minutes', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="frequency">Frequency</label>
          <input
            id="frequency"
            type="text"
            placeholder="e.g. First time, daily, weekly"
            value={form.frequency}
            onChange={(e) => update('frequency', e.target.value)}
          />
        </div>
      </div>

      <label htmlFor="environmental_factors">Relevant environmental factors</label>
      <textarea
        id="environmental_factors"
        placeholder="e.g. noise, lighting, transitions, sleep, changes to routine"
        value={form.environmental_factors}
        onChange={(e) => update('environmental_factors', e.target.value)}
      />

      <label htmlFor="follow_up_action">Follow-up action</label>
      <textarea id="follow_up_action" value={form.follow_up_action} onChange={(e) => update('follow_up_action', e.target.value)} />

      <label className="platform-checkbox-label">
        <input
          type="checkbox"
          checked={form.safeguarding_concern}
          onChange={(e) => update('safeguarding_concern', e.target.checked)}
        />
        This observation raises a safeguarding concern
      </label>
      {form.safeguarding_concern && (
        <>
          <label htmlFor="safeguarding_notes">Safeguarding notes</label>
          <textarea
            id="safeguarding_notes"
            value={form.safeguarding_notes}
            onChange={(e) => update('safeguarding_notes', e.target.value)}
          />
          <p className="platform-form-hint">
            If a child is in immediate danger, contact emergency services now. This form does not replace
            your organisation's safeguarding procedure — follow it as well as recording here.
          </p>
        </>
      )}

      {error && <p className="platform-form-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save observation'}
      </button>
    </form>
  )
}
