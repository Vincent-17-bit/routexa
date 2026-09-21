import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'About', to: '/about' }
]

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 glass bg-surface-light dark:bg-surface-dark border-b border-card-light dark:border-card-dark">
      <span className="font-bold text-lg tracking-tight">ROUTEXA</span>

      <nav className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-traffic-clear-light dark:bg-traffic-clear-dark" />
        </span>
        <span className="text-xs font-semibold text-traffic-clear-light dark:text-traffic-clear-dark">LIVE</span>
      </div>
    </header>
  )
}
