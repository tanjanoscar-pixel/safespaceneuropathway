export type ArchetypeKey =
  | 'warrior'
  | 'sage'
  | 'empath'
  | 'creator'
  | 'healer'
  | 'anchor'

export type ArchetypeScores = Record<ArchetypeKey, number>

export type Archetype = {
  id: string
  key: ArchetypeKey
  name: string
  tagline: string
  description: string
  color_primary: string
  color_secondary: string
  traits: string[]
  created_at: string
}

export type TrustedContact = {
  name: string
  relationship: string
  phone?: string
  email?: string
}

export type Profile = {
  id: string
  email: string
  display_name: string | null
  archetype_key: ArchetypeKey | null
  archetype_scores: ArchetypeScores | null
  onboarding_completed: boolean
  trusted_contacts: TrustedContact[]
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type TriageQuestionOption = {
  text: string
  archetype: ArchetypeKey
}

export type TriageQuestion = {
  id: number
  question: string
  display_order: number
  options: TriageQuestionOption[]
  created_at: string
}

export type AuditLog = {
  id: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; email: string }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      archetypes: {
        Row: Archetype
        Insert: Omit<Archetype, 'id' | 'created_at'>
        Update: Partial<Omit<Archetype, 'id' | 'created_at'>>
        Relationships: []
      }
      triage_questions: {
        Row: TriageQuestion
        Insert: Omit<TriageQuestion, 'created_at'>
        Update: Partial<Omit<TriageQuestion, 'id' | 'created_at'>>
        Relationships: []
      }
      audit_logs: {
        Row: AuditLog
        Insert: {
          action: string
          user_id?: string | null
          table_name?: string | null
          record_id?: string | null
          metadata?: Record<string, unknown>
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
