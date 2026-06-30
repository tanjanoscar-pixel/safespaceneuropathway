'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const { valid, errors } = validatePassword(password)
    if (!valid) {
      setError(`Password needs: ${errors.join(', ')}.`)
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { display_name: displayName.trim() || null },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update display name in profile if provided
    if (displayName.trim()) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ display_name: displayName.trim() })
          .eq('id', user.id)
      }
    }

    router.push('/onboarding/archetype')
  }

  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        {/* Logo */}
        <Link href="/" className="mb-10 text-xl font-bold tracking-tight">
          ALT<span className="text-teal-500">er</span>Ego
        </Link>

        {/* Card */}
        <div className="card w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Start your journey
            </h1>
            <p className="text-text-secondary text-sm">
              Create your account to find your archetype.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            {/* Display name (optional) */}
            <div>
              <label htmlFor="displayName" className="input-label">
                Name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What would you like to be called?"
                className="input-field"
                autoComplete="name"
                maxLength={50}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
                autoComplete="email"
                aria-describedby={error ? 'form-error' : undefined}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="input-field"
                required
                autoComplete="new-password"
                aria-describedby={error ? 'form-error' : undefined}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                id="form-error"
                role="alert"
                className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-xs text-text-muted text-center max-w-sm">
          Your data is yours. Encrypted at rest, isolated by design.
          No sharing, no profiling, no bullshit.
        </p>
      </div>
    </div>
  )
}
