import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ALTerEgo — Prevention Is the Cure',
    template: '%s | ALTerEgo',
  },
  description:
    'Your personalised mental health companion. Find your archetype. Meet OneNoir. Small steps create big change.',
  keywords: ['mental health', 'wellbeing', 'archetype', 'prevention', 'support'],
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: 'ALTerEgo',
    description: 'Prevention Is the Cure.',
    siteName: 'ALTerEgo',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080B14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
