// Rule-based (not machine-learning) pattern detection. Every result here is a
// *candidate* for an authorised human to review - never a diagnosis, a fact,
// or an automatic safeguarding decision. Confidence reflects only how many
// observations support the candidate, nothing clinical.

const SENSORY_KEYWORDS = ['loud', 'noise', 'noisy', 'bright', 'light', 'smell', 'texture', 'crowd']
const TRANSITION_KEYWORDS = ['transition', 'change of routine', 'moving to', 'switch', 'new setting', 'unexpected change']
const SLEEP_KEYWORDS = ['sleep', 'tired', 'awake', 'nap', 'up all night', 'didn’t sleep']
const DEMAND_KEYWORDS = ['demand', 'instruction', 'told to', 'asked to', 'homework', 'test', 'deadline']

function confidenceFor(count) {
  if (count >= 7) return 'high'
  if (count >= 5) return 'medium'
  return 'low'
}

function textOf(observation) {
  return [
    observation.antecedent,
    observation.observation,
    observation.environmental_factors,
    observation.follow_up_action,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function keywordDimension(observations, keywords, dimension, label) {
  const matches = observations.filter((o) => {
    const text = textOf(o)
    return keywords.some((k) => text.includes(k))
  })
  if (matches.length < 3) return null
  return {
    dimension,
    description: `${label} appear in the account of what happened in ${matches.length} of the last ${observations.length} observations recorded.`,
    supporting_observation_ids: matches.map((o) => o.id),
    confidence: confidenceFor(matches.length),
  }
}

function groupedDimension(observations, keyFn, dimension, describe) {
  const groups = new Map()
  for (const o of observations) {
    const key = keyFn(o)
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(o)
  }
  const suggestions = []
  for (const [key, group] of groups.entries()) {
    if (group.length < 3) continue
    suggestions.push({
      dimension,
      description: describe(key, group.length, observations.length),
      supporting_observation_ids: group.map((o) => o.id),
      confidence: confidenceFor(group.length),
    })
  }
  return suggestions
}

export function detectPatterns(observations) {
  if (!observations || observations.length < 3) return []

  const suggestions = []

  suggestions.push(
    ...groupedDimension(
      observations,
      (o) => o.setting,
      'setting',
      (setting, count, total) =>
        `"${setting}" is recorded as the setting in ${count} of the last ${total} observations.`,
    ),
  )

  suggestions.push(
    ...groupedDimension(
      observations,
      (o) => new Date(o.observed_at).toLocaleDateString(undefined, { weekday: 'long' }),
      'time',
      (day, count, total) =>
        `${count} of the last ${total} observations were recorded on a ${day}.`,
    ),
  )

  const sensory = keywordDimension(observations, SENSORY_KEYWORDS, 'sensory', 'Sensory-related descriptions (noise, light, texture, crowding)')
  if (sensory) suggestions.push(sensory)

  const transitions = keywordDimension(observations, TRANSITION_KEYWORDS, 'transitions', 'Mentions of a transition or change of routine')
  if (transitions) suggestions.push(transitions)

  const sleep = keywordDimension(observations, SLEEP_KEYWORDS, 'sleep', 'Mentions of sleep or tiredness')
  if (sleep) suggestions.push(sleep)

  const demands = keywordDimension(observations, DEMAND_KEYWORDS, 'demands', 'Mentions of a task, instruction or demand placed on the child')
  if (demands) suggestions.push(demands)

  return suggestions
}
