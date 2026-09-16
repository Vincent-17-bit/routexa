const OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All time' }
]

export default function RangeSegment({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border-[0.5px] border-border bg-nested p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1 text-xs ${
            value === opt.value ? 'bg-cyan-bg text-cyan' : 'text-text-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
