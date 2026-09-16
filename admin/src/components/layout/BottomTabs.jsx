import { NAV_ITEMS, MOBILE_TABS } from '../../lib/nav'
import { usePath, navigate } from '../../lib/router'

export default function BottomTabs() {
  const path = usePath()
  const items = NAV_ITEMS.filter((i) => MOBILE_TABS.includes(i.path))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t-[0.5px] border-border bg-surface">
      {items.map((item) => {
        const active = path === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] ${
              active ? 'text-cyan' : 'text-text-secondary'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label.split(' ')[0]}
          </button>
        )
      })}
    </nav>
  )
}
