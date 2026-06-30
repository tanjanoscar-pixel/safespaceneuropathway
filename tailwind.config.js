/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04060D',
          900: '#080B14',
          850: '#0A0E1A',
          800: '#0D1117',
          750: '#111827',
          700: '#1A2236',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        archetype: {
          warrior: '#EF4444',
          sage: '#8B5CF6',
          empath: '#06B6D4',
          creator: '#F59E0B',
          healer: '#10B981',
          anchor: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'breathe': 'breathe 6s ease-in-out infinite',
        'neural-pulse': 'neural-pulse 4s ease-in-out infinite',
        'eye-glow': 'eye-glow 3s ease-in-out infinite',
        'fade-in': 'fade-in 1.2s ease-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',
        'reveal': 'reveal 1.5s ease-out forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.03)' },
        },
        'neural-pulse': {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
        'eye-glow': {
          '0%, 100%': { opacity: '0.7', transform: 'scaleY(1)' },
          '50%': { opacity: '1', transform: 'scaleY(1.1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
