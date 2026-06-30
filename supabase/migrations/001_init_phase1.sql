-- ============================================================
-- ALTerEgo Phase 1 — Database Schema
-- Prevention Is the Cure.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ARCHETYPES TABLE
-- 6 character types based on lived experience
-- ============================================================
CREATE TABLE IF NOT EXISTS archetypes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  tagline       TEXT NOT NULL,
  description   TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  traits        TEXT[] NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TRIAGE QUESTIONS TABLE
-- 10 onboarding questions with archetype-mapped options
-- ============================================================
CREATE TABLE IF NOT EXISTS triage_questions (
  id            INTEGER PRIMARY KEY,
  question      TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  options       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PROFILES TABLE
-- User data + archetype assignment
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  display_name          TEXT,
  archetype_key         TEXT REFERENCES archetypes(key) ON DELETE SET NULL,
  archetype_scores      JSONB,
  onboarding_completed  BOOLEAN DEFAULT FALSE NOT NULL,
  trusted_contacts      JSONB DEFAULT '[]'::jsonb NOT NULL,
  preferences           JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- AUDIT LOGS TABLE
-- GDPR compliance + mutation tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS profiles_archetype_key_idx
  ON profiles(archetype_key);

CREATE INDEX IF NOT EXISTS profiles_onboarding_idx
  ON profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx
  ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_action_idx
  ON audit_logs(action);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetypes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_questions ENABLE ROW LEVEL SECURITY;

-- Profiles: users own their row
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Audit logs: users can insert + read own
CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_logs_insert_own" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Archetypes: public read (no auth required)
CREATE POLICY "archetypes_public_read" ON archetypes
  FOR SELECT USING (true);

-- Triage questions: public read
CREATE POLICY "triage_questions_public_read" ON triage_questions
  FOR SELECT USING (true);

-- ============================================================
-- SEED: ARCHETYPES (6 types based on lived experience)
-- ============================================================
INSERT INTO archetypes (key, name, tagline, description, color_primary, color_secondary, traits)
VALUES
(
  'warrior',
  'The Warrior',
  'Strength forged in survival',
  'You have faced storms that would break others. Your resilience is not naivety — it is hard-won wisdom. You know what it means to fall and still choose to rise. Your nervous system has learned to fight, and that has kept you alive. Now, we help you learn when to rest.',
  '#EF4444', '#DC2626',
  ARRAY['Resilient', 'Determined', 'Direct', 'Protective', 'Tenacious']
),
(
  'sage',
  'The Sage',
  'Clarity through the chaos',
  'Your mind is your greatest tool and sometimes your greatest burden. You understand more than most — you see patterns, make connections, and need to understand things before you can accept them. That intelligence is your gift. Now we help you learn to feel as well as think.',
  '#8B5CF6', '#7C3AED',
  ARRAY['Insightful', 'Analytical', 'Reflective', 'Perceptive', 'Deliberate']
),
(
  'empath',
  'The Empath',
  'Depth is your superpower',
  'You feel everything — and that is not weakness. Your capacity for connection and emotional depth is extraordinary. You know what it means to truly witness someone else''s pain. The world needs your sensitivity. Now we help you protect it without losing it.',
  '#06B6D4', '#0891B2',
  ARRAY['Sensitive', 'Connected', 'Compassionate', 'Intuitive', 'Authentic']
),
(
  'creator',
  'The Creator',
  'Making meaning from pain',
  'You turn experience into expression. When words fail, you find another way — music, art, writing, movement. Your creativity is not escapism; it is translation. You transform what cannot be spoken into something the world can hold. Keep making.',
  '#F59E0B', '#D97706',
  ARRAY['Expressive', 'Innovative', 'Imaginative', 'Adaptive', 'Passionate']
),
(
  'healer',
  'The Healer',
  'Integration is your path',
  'You have walked through darkness and come back with a lantern. You understand healing not as a destination but as a practice. You carry others not because you are required to, but because you have been there. Now we help you remember: you deserve the same care you give.',
  '#10B981', '#059669',
  ARRAY['Nurturing', 'Integrative', 'Wise', 'Generous', 'Purposeful']
),
(
  'anchor',
  'The Anchor',
  'Steady is a kind of strength',
  'You are the calm in the storm — for yourself and for others. You find stability not through avoidance but through presence. Your groundedness is not rigidity; it is roots. The world feels your steadiness even when you cannot feel it yourself. You are more stable than you know.',
  '#94A3B8', '#64748B',
  ARRAY['Grounded', 'Steadfast', 'Reliable', 'Calm', 'Methodical']
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED: TRIAGE QUESTIONS (10 questions)
-- ============================================================
INSERT INTO triage_questions (id, question, display_order, options)
VALUES
(1, 'When you''re struggling, what do you reach for first?', 1,
  '[
    {"text": "Fight through it alone — I push through", "archetype": "warrior"},
    {"text": "Space to think — I need to understand it first", "archetype": "sage"},
    {"text": "Someone who gets it — I need to feel heard", "archetype": "empath"},
    {"text": "A creative outlet — I need to express it", "archetype": "creator"},
    {"text": "A way to fix things — I want to make it better", "archetype": "healer"},
    {"text": "Something grounding — I need to feel stable", "archetype": "anchor"}
  ]'::jsonb),

(2, 'What best describes your greatest strength?', 2,
  '[
    {"text": "Resilience — I keep getting back up no matter what", "archetype": "warrior"},
    {"text": "Insight — I see patterns others miss", "archetype": "sage"},
    {"text": "Connection — I feel deeply and people know I mean it", "archetype": "empath"},
    {"text": "Expression — I create meaning from chaos", "archetype": "creator"},
    {"text": "Integration — I help others heal because I''ve been there", "archetype": "healer"},
    {"text": "Steadiness — I''m the calm in the storm", "archetype": "anchor"}
  ]'::jsonb),

(3, 'When your nervous system fires up, you tend to…', 3,
  '[
    {"text": "Face it head-on — I''d rather fight than freeze", "archetype": "warrior"},
    {"text": "Retreat and analyse — I need to understand what''s happening", "archetype": "sage"},
    {"text": "Seek connection — I need someone safe nearby", "archetype": "empath"},
    {"text": "Create something — I need to express what''s inside", "archetype": "creator"},
    {"text": "Help someone else — it takes me out of my own head", "archetype": "healer"},
    {"text": "Ground myself — body, breath, routine, sensation", "archetype": "anchor"}
  ]'::jsonb),

(4, 'Your relationship with vulnerability is…', 4,
  '[
    {"text": "Something to overcome and grow stronger from", "archetype": "warrior"},
    {"text": "Data — I examine it to understand myself better", "archetype": "sage"},
    {"text": "A bridge to real connection with others", "archetype": "empath"},
    {"text": "Raw material — I transform it into something", "archetype": "creator"},
    {"text": "A teacher — it shows me where healing is needed", "archetype": "healer"},
    {"text": "Something to sit with steadily, without panic", "archetype": "anchor"}
  ]'::jsonb),

(5, 'What do you most need when things are really dark?', 5,
  '[
    {"text": "Someone to believe in my ability to survive this", "archetype": "warrior"},
    {"text": "Space to figure it out without being rushed", "archetype": "sage"},
    {"text": "To feel truly understood, not fixed or advised", "archetype": "empath"},
    {"text": "Permission to feel everything, no filter", "archetype": "creator"},
    {"text": "A sense of purpose — to be useful to someone", "archetype": "healer"},
    {"text": "Routine, safety, something I can count on", "archetype": "anchor"}
  ]'::jsonb),

(6, 'How do you process difficult emotions?', 6,
  '[
    {"text": "I push through them until I''m past them", "archetype": "warrior"},
    {"text": "I journal, analyse, and try to understand them", "archetype": "sage"},
    {"text": "I talk them through with someone I trust", "archetype": "empath"},
    {"text": "I express them — music, writing, art, movement", "archetype": "creator"},
    {"text": "I work through them by focusing on helping others", "archetype": "healer"},
    {"text": "I wait them out with grounding practices and routine", "archetype": "anchor"}
  ]'::jsonb),

(7, 'Your biggest challenge tends to be…', 7,
  '[
    {"text": "Knowing when to rest instead of push harder", "archetype": "warrior"},
    {"text": "Getting out of my head and into my body", "archetype": "sage"},
    {"text": "Setting limits on how much I give to others", "archetype": "empath"},
    {"text": "Following through once the initial spark fades", "archetype": "creator"},
    {"text": "Putting my own needs first for once", "archetype": "healer"},
    {"text": "Tolerating uncertainty and things I can''t control", "archetype": "anchor"}
  ]'::jsonb),

(8, 'People come to you when they need…', 8,
  '[
    {"text": "Direct truth and the courage to face hard things", "archetype": "warrior"},
    {"text": "Perspective, wisdom, a different way of seeing", "archetype": "sage"},
    {"text": "To feel heard, seen, and not alone", "archetype": "empath"},
    {"text": "Fresh ideas or a creative approach to their problem", "archetype": "creator"},
    {"text": "Someone who''s been through it and came back", "archetype": "healer"},
    {"text": "Calm, steadiness, someone who won''t panic", "archetype": "anchor"}
  ]'::jsonb),

(9, 'Which phrase lands closest to your core truth?', 9,
  '[
    {"text": "\"I survived. I will survive this too.\"", "archetype": "warrior"},
    {"text": "\"Understanding is the beginning of everything.\"", "archetype": "sage"},
    {"text": "\"You are not alone in this. Not ever.\"", "archetype": "empath"},
    {"text": "\"Pain can become something that matters.\"", "archetype": "creator"},
    {"text": "\"Healing is possible. I am living proof.\"", "archetype": "healer"},
    {"text": "\"Small, steady steps. That is how we get there.\"", "archetype": "anchor"}
  ]'::jsonb),

(10, 'When you imagine your best self, they are…', 10,
  '[
    {"text": "Unbreakable — and wise enough to know their limits", "archetype": "warrior"},
    {"text": "Clear, calm, and deeply knowing", "archetype": "sage"},
    {"text": "Deeply connected and emotionally free", "archetype": "empath"},
    {"text": "Making something that actually matters", "archetype": "creator"},
    {"text": "A light for others who are still in the dark", "archetype": "healer"},
    {"text": "The root that keeps others standing in the storm", "archetype": "anchor"}
  ]'::jsonb)

ON CONFLICT (id) DO NOTHING;
