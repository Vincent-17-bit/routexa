import { useState } from 'react'
import FilterChecklists from './FilterChecklists'
import BottomSheet from './BottomSheet'

export default function FilterPanel({ filters, toggleBrowser, toggleDevice, resetAll }) {
  const [open, setOpen] = useState(false)
  const activeCount = filters.browser.length + filters.device.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border-[0.5px] border-border bg-nested px-3 py-1.5 text-xs text-text-secondary"
      >
        Filters{activeCount ? ` (${activeCount})` : ''}
      </button>

      {open && (
        <div className="hidden md:block absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border-[0.5px] border-border bg-surface p-4 shadow-none">
          <FilterChecklists
            browser={filters.browser}
            device={filters.device}
            onToggleBrowser={toggleBrowser}
            onToggleDevice={toggleDevice}
          />
          <div className="mt-4 flex items-center justify-between text-xs">
            <button onClick={resetAll} className="text-text-muted hover:text-danger">
              Reset all
            </button>
            <button onClick={() => setOpen(false)} className="text-cyan">
              Done
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Filter and sort" initialStage="sheet3">
          <FilterChecklists
            browser={filters.browser}
            device={filters.device}
            onToggleBrowser={toggleBrowser}
            onToggleDevice={toggleDevice}
          />
          <div className="sticky bottom-0 mt-4 flex items-center justify-between bg-surface pt-2 text-xs">
            <button onClick={resetAll} className="text-text-muted hover:text-danger">
              Reset all
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg bg-cyan-bg px-3 py-1.5 text-cyan">
              Done
            </button>
          </div>
        </BottomSheet>
      </div>
    </div>
  )
}
