import { useState } from 'react'

const STAGES = ['sheet1', 'sheet2', 'sheet3']
const HEIGHT_CLASS = { sheet1: 'h-sheet1', sheet2: 'h-sheet2', sheet3: 'h-sheet3' }

export default function BottomSheet({ open, onClose, title, children, initialStage = 'sheet2' }) {
  const [stage, setStage] = useState(initialStage)
  if (!open) return null

  const cycle = () => setStage((s) => STAGES[(STAGES.indexOf(s) + 1) % STAGES.length])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog">
      <div className="flex-1" onClick={onClose} />
      <div className={`${HEIGHT_CLASS[stage]} rounded-t-xl border-t-[0.5px] border-border bg-surface transition-[height] duration-200 flex flex-col`}>
        <button onClick={cycle} className="mx-auto mt-2 h-1 w-10 rounded-full bg-nested" aria-label="resize sheet" />
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-text-primary">{title}</span>
          <button onClick={onClose} className="text-text-muted" aria-label="close">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>
  )
}
