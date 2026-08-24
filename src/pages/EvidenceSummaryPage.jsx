import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthProvider'

const SECTION_LABELS = {
  child_family_voice: "Child and family voice",
  strengths_and_interests: 'Strengths and interests',
  special_educational_needs: 'Special educational needs',
  communication_and_interaction: 'Communication and interaction',
  cognition_and_learning: 'Cognition and learning',
  social_emotional_mental_health: 'Social, emotional and mental health',
  sensory_and_physical_needs: 'Sensory and physical needs',
  existing_provision: 'Existing provision',
  support_tried: 'Support that has been tried',
  what_worked: 'What has worked',
  what_did_not_work: 'What has not worked',
  desired_outcomes: 'Desired outcomes',
  missing_evidence: 'Areas where evidence is still missing',
}

function emptySections() {
  return Object.fromEntries(Object.keys(SECTION_LABELS).map((k) => [k, '']))
}

async function buildDraftContent(childId) {
  const sections = emptySections()
  const sourceObservationIds = []
  const sourcePatternIds = []

  const { data: observations } = await supabase
    .from('observations')
    .select('id, observed_at, setting, strengths, child_words, support_provided, what_helped, what_did_not_help')
    .eq('child_id', childId)
    .order('observed_at', { ascending: false })
    .limit(30)

  for (const o of observations ?? []) {
    const date = new Date(o.observed_at).toLocaleDateString()
    if (o.strengths) {
      sections.strengths_and_interests += `- ${o.strengths} (observed ${date}, ${o.setting})\n`
      sourceObservationIds.push(o.id)
    }
    if (o.child_words) {
      sections.child_family_voice += `- "${o.child_words}" (${date})\n`
      sourceObservationIds.push(o.id)
    }
    if (o.support_provided) {
      sections.support_tried += `- ${o.support_provided} (${date}, ${o.setting})\n`
      sourceObservationIds.push(o.id)
    }
    if (o.what_helped) {
      sections.what_worked += `- ${o.what_helped} (${date})\n`
      sourceObservationIds.push(o.id)
    }
    if (o.what_did_not_help) {
      sections.what_did_not_work += `- ${o.what_did_not_help} (${date})\n`
      sourceObservationIds.push(o.id)
    }
  }

  const { data: patterns } = await supabase
    .from('ai_patterns')
    .select('id, domain, description')
    .eq('child_id', childId)

  for (const p of patterns ?? []) {
    sections.special_educational_needs += `- Reviewed pattern (${p.domain}): ${p.description}\n`
    sourcePatternIds.push(p.id)
  }

  const { data: plans } = await supabase
    .from('interventions')
    .select('desired_outcome')
    .eq('child_id', childId)

  for (const plan of plans ?? []) {
    if (plan.desired_outcome) sections.desired_outcomes += `- ${plan.desired_outcome}\n`
  }

  for (const key of Object.keys(sections)) {
    if (!sections[key].trim()) sections[key] = '(No evidence recorded for this area yet.)'
  }

  return {
    sections,
    sourceObservationIds: [...new Set(sourceObservationIds)],
    sourcePatternIds: [...new Set(sourcePatternIds)],
  }
}

export function EvidenceSummaryPage() {
  const { childId } = useOutletContext()
  const { user } = useAuth()
  const [reports, setReports] = useState(null)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [editedSections, setEditedSections] = useState(null)
  const [savingId, setSavingId] = useState(null)

  const load = useCallback(() => {
    supabase
      .from('ehcp_reports')
      .select('*')
      .eq('child_id', childId)
      .eq('report_type', 'evidence_summary')
      .order('version', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message)
        else setReports(data ?? [])
      })
  }, [childId])

  useEffect(() => {
    load()
  }, [load])

  async function generateDraft() {
    setGenerating(true)
    setError(null)
    const content = await buildDraftContent(childId)
    const nextVersion = reports && reports.length > 0 ? Math.max(...reports.map((r) => r.version)) + 1 : 1
    const { error: insertError } = await supabase.from('ehcp_reports').insert({
      child_id: childId,
      user_id: user.id,
      report_type: 'evidence_summary',
      content,
      version: nextVersion,
      status: 'draft',
    })
    setGenerating(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    load()
  }

  function startEditing(report) {
    setEditedSections({ id: report.id, ...report.content.sections })
  }

  async function saveEdits() {
    const { id, ...sections } = editedSections
    setSavingId(id)
    const report = reports.find((r) => r.id === id)
    const { error: updateError } = await supabase
      .from('ehcp_reports')
      .update({ content: { ...report.content, sections } })
      .eq('id', id)
    setSavingId(null)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setEditedSections(null)
    load()
  }

  async function approve(report) {
    const { error: approveError } = await supabase
      .from('ehcp_reports')
      .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', report.id)
    if (approveError) {
      setError(approveError.message)
      return
    }
    load()
  }

  return (
    <div>
      <p className="platform-notice">
        This summary supports evidence organisation and professional review. It does not determine
        eligibility for an EHCP, replace statutory assessment or make a clinical or legal decision.
      </p>

      <button type="button" onClick={generateDraft} disabled={generating}>
        {generating ? 'Generating…' : 'Generate new draft from evidence'}
      </button>

      {error && <p className="platform-form-error">{error}</p>}

      {reports === null && <p>Loading…</p>}
      {reports && reports.length === 0 && <p>No evidence summary has been generated yet.</p>}

      {reports &&
        reports.map((report) => (
          <div key={report.id} className="platform-candidate-card">
            <p>
              <strong>Version {report.version}</strong> · status: {report.status} · generated{' '}
              {new Date(report.generated_at).toLocaleDateString()}
            </p>

            {editedSections?.id === report.id ? (
              <>
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <label>{label}</label>
                    <textarea
                      value={editedSections[key] ?? ''}
                      onChange={(e) => setEditedSections((s) => ({ ...s, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <button type="button" onClick={saveEdits} disabled={savingId === report.id}>
                  Save edits
                </button>
              </>
            ) : (
              <>
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <strong>{label}</strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{report.content.sections?.[key]}</p>
                  </div>
                ))}
                <div className="platform-form-row">
                  {report.status === 'draft' && (
                    <>
                      <button type="button" onClick={() => startEditing(report)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => approve(report)}>
                        Approve for use
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}
