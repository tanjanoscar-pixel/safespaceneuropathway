import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If onboarding not complete, redirect
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding/archetype')
  }

  return <DashboardClient profile={profile} />
}
