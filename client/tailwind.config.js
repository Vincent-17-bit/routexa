/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: { light: '#F4F8F5', dark: '#0F172A' },
        surface: { light: 'rgba(255,255,255,0.85)', dark: 'rgba(15,23,42,0.85)' },
        text: {
          primary: { light: '#1E293B', dark: '#F8FAFC' },
          secondary: { light: '#64748B', dark: '#94A3B8' }
        },
        route: {
          active: { light: '#0D9488', dark: '#14B8A6' },
          alt: { light: '#9CA3AF', dark: '#64748B' },
          destination: { light: '#DB2777', dark: '#F472B6' }
        },
        danger: { light: '#DC2626', dark: '#EF4444' },
        accent: { light: '#0D9488', dark: '#14B8A6' },
        traffic: {
          heavy: { light: '#DC2626', dark: '#EF4444', badge: 'rgba(220,38,38,0.12)', text: { light: '#B91C1C', dark: '#FCA5A5' } },
          moderate: { light: '#D97706', dark: '#F59E0B', badge: 'rgba(217,119,6,0.12)', text: { light: '#B45309', dark: '#FCD34D' } },
          clear: { light: '#059669', dark: '#10B981', badge: 'rgba(5,150,105,0.12)', text: { light: '#047857', dark: '#6EE7B7' } }
        },
        terrain: '#EBF6EE'
      },
      borderColor: {
        card: { light: 'rgba(226,232,240,0.8)', dark: 'rgba(51,65,85,0.6)' }
      }
    }
  },
  plugins: []
}
