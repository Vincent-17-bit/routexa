export default function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-nested px-2.5 py-1 text-xs text-text-secondary">
      {label}
      <button onClick={onRemove} className="text-text-muted hover:text-danger" aria-label={`remove ${label}`}>
        ×
      </button>
    </span>
  )
}
