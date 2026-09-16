export default function MetricCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border-[0.5px] border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-text-secondary text-xs">
        <span className="text-cyan">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl text-text-primary">{value}</div>
    </div>
  )
}
