'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { validateEmail } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email or password is incorrect. Try again.'
          : signInError.message
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
              Welcome back
            </h1>
            <p className="text-text-secondary text-sm">
              Sign in to continue your journey.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
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
                placeholder="Your password"
                className="input-field"
                required
                autoComplete="current-password"
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            New here?{' '}
            <Link
              href="/auth/register"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
