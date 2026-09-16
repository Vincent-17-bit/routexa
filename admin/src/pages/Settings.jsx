import { useTheme } from '../lib/theme'

export default function Settings() {
  const { theme, toggle } = useTheme()

  return (
    <div className="rounded-xl border-[0.5px] border-border bg-surface p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-primary">Theme</span>
        <button onClick={toggle} className="rounded-lg border-[0.5px] border-border bg-nested px-3 py-1.5 text-xs text-text-secondary">
          {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        </button>
      </div>
    </div>
  )
}
