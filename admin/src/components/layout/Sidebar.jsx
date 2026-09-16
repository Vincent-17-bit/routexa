import { NAV_ITEMS } from '../../lib/nav'
import { usePath, navigate } from '../../lib/router'

export default function Sidebar() {
  const path = usePath()

  return (
    <nav className="hidden md:flex md:flex-col w-14 lg:w-[180px] shrink-0 border-r-[0.5px] border-border bg-surface py-3">
      {NAV_ITEMS.map((item) => {
        const active = path === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={item.label}
            className={`group flex items-center gap-3 px-4 py-2.5 text-sm border-l-2 ${
              active ? 'border-cyan bg-cyan-bg text-cyan' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="w-4 text-center">{item.icon}</span>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
