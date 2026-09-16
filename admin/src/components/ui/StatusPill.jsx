export default function StatusPill({ tone, children }) {
  const map = {
    success: 'bg-success-bg text-success',
    danger: 'bg-danger-bg text-danger',
    neutral: 'bg-nested text-text-secondary'
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[tone] || map.neutral}`}>
      {children}
    </span>
  )
}
