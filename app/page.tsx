import Link from 'next/link'
import OneNoir from '@/components/OneNoir'

export default function LandingPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-navy-750/40">
        <span className="text-lg font-bold tracking-tight text-white">
          ALT<span className="text-teal-500">er</span>Ego
        </span>
        <Link
          href="/auth/login"
          className="text-sm text-text-secondary hover:text-white transition-colors duration-200"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
        {/* OneNoir character */}
        <div className="mb-10">
          <OneNoir state="intro" size="lg" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span className="text-white">Find your </span>
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            }}
          >
            divine
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-light text-text-secondary mb-3 max-w-xl">
          Prevention Is the Cure
        </p>

        {/* Description */}
        <p className="text-base text-text-muted max-w-lg mb-12 leading-relaxed">
          A companion built on lived experience — not clinical theory. Discover
          your archetype, meet OneNoir, and take small steps toward something
          that actually matters.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/auth/register" className="btn-primary flex-1 text-center">
            Find Your Archetype
          </Link>
          <Link href="/auth/login" className="btn-ghost flex-1 text-center">
            Sign In
          </Link>
        </div>

        {/* Phase note */}
        <p className="mt-8 text-xs text-text-muted opacity-60">
          Phase 1 — Authentication + Archetype Discovery
        </p>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-navy-750/40">
        <p className="text-xs text-text-muted">
          Built with lived experience.{' '}
          <span className="text-teal-500/70">Small steps create big change.</span>
        </p>
      </footer>
    </div>
  )
}
