const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']
const DEVICES = ['PC', 'Mobile', 'Tablet', 'Other']

function Group({ title, options, selected, onToggle }) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-text-muted">{title}</div>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function FilterChecklists({ browser, device, onToggleBrowser, onToggleDevice }) {
  return (
    <div className="flex flex-col gap-4">
      <Group title="Browser" options={BROWSERS} selected={browser} onToggle={onToggleBrowser} />
      <Group title="Device type" options={DEVICES} selected={device} onToggle={onToggleDevice} />
    </div>
  )
}
