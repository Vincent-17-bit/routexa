import { useTheme } from '../../lib/theme'

export default function Topbar() {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between border-b-[0.5px] border-border bg-surface px-4 py-3">
      <span className="text-sm text-text-primary">ROUTEXA <span className="text-cyan">admin</span></span>
      <button
        onClick={toggle}
        className="rounded-lg border-[0.5px] border-border bg-nested px-3 py-1 text-xs text-text-secondary"
      >
        {theme === 'dark' ? 'Dark' : 'Light'}
      </button>
    </header>
  )
}
