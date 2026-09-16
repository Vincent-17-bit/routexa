/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        page: 'var(--page)',
        surface: 'var(--surface)',
        nested: 'var(--nested)',
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        },
        cyan: { DEFAULT: 'var(--cyan)', bg: 'var(--cyan-bg)' },
        success: { DEFAULT: 'var(--success)', bg: 'var(--success-bg)' },
        danger: { DEFAULT: 'var(--danger)', bg: 'var(--danger-bg)' }
      },
      height: {
        sheet1: '52px',
        sheet2: '180px',
        sheet3: '80vh'
      }
    }
  },
  plugins: []
}
