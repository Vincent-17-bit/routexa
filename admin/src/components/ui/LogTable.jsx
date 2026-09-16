import { useState } from 'react'
import { useLogFilters } from '../../hooks/useLogFilters'
import { useLogData } from '../../hooks/useLogData'
import { softDeleteLog, restoreLog, getDeletedLogs, exportLogsUrl } from '../../lib/api'
import RangeSegment from './RangeSegment'
import FilterPanel from './FilterPanel'
import Chip from './Chip'

function SortHeader({ label, col, current, dir, onSort }) {
  const active = current === col
  return (
    <button onClick={() => onSort(col)} className={`flex items-center gap-1 ${active ? 'text-cyan' : 'text-text-secondary'}`}>
      {label}
      {active && <span>{dir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )
}

export default function LogTable({ type, columns, renderMobileRow }) {
  const { filters, setRange, toggleBrowser, toggleDevice, setSort, removeChip, resetAll, chips } = useLogFilters()
  const [page, setPage] = useState(0)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedRows, setDeletedRows] = useState([])
  const { rows, loading } = useLogData(type, filters, page)

  const reload = () => setPage((p) => p)

  async function handleDelete(id) {
    await softDeleteLog(type, id)
    setPage((p) => p)
  }

  async function openDeleted() {
    const data = await getDeletedLogs(type, {})
    setDeletedRows(data.rows)
    setShowDeleted(true)
  }

  async function handleRestore(id) {
    await restoreLog(type, id)
    const data = await getDeletedLogs(type, {})
    setDeletedRows(data.rows)
  }

  const exportParams = { ...filters, browser: filters.browser.join(','), device: filters.device.join(',') }

  return (
    <div className="rounded-xl border-[0.5px] border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b-[0.5px] border-border p-3">
        <RangeSegment value={filters.range} onChange={setRange} />
        <FilterPanel filters={filters} toggleBrowser={toggleBrowser} toggleDevice={toggleDevice} resetAll={resetAll} />
        <div className="ml-auto flex items-center gap-2">
          <a href={exportLogsUrl(type, exportParams, 'csv')} className="text-xs text-text-secondary hover:text-cyan">
            CSV
          </a>
          <a href={exportLogsUrl(type, exportParams, 'json')} className="text-xs text-text-secondary hover:text-cyan">
            JSON
          </a>
          <button onClick={openDeleted} className="text-xs text-text-secondary hover:text-cyan">
            Recently deleted
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b-[0.5px] border-border p-3">
          {chips.map((c) => (
            <Chip key={`${c.kind}-${c.val}`} label={c.label} onRemove={() => removeChip(c.kind, c.val)} />
          ))}
          <button onClick={resetAll} className="text-xs text-text-muted hover:text-danger">
            Reset all
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-sm text-text-muted">Loading…</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border text-left text-xs">
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-2">
                      <SortHeader label={c.label} col={c.key} current={filters.sort} dir={filters.dir} onSort={setSort} />
                    </th>
                  ))}
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b-[0.5px] border-border hover:bg-nested">
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-2 text-text-primary">
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => handleDelete(row.id)} className="text-text-muted hover:text-danger" aria-label="delete">
                        ⌫
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-border">
            {rows.map((row) => renderMobileRow(row, () => handleDelete(row.id)))}
          </div>

          <div className="flex items-center justify-between p-3 text-xs text-text-secondary">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(p - 1, 0))} className="disabled:opacity-40">
              Prev
            </button>
            <span>Page {page + 1}</span>
            <button disabled={rows.length < 25} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
              Next
            </button>
          </div>
        </>
      )}

      {showDeleted && (
        <div className="border-t-[0.5px] border-border p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-text-secondary">
            Recently deleted
            <button onClick={() => setShowDeleted(false)} className="text-text-muted">
              Close
            </button>
          </div>
          <div className="divide-y divide-border">
            {deletedRows.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-text-secondary">{row.device_id} · {row.timestamp}</span>
                <button onClick={() => handleRestore(row.id)} className="text-cyan text-xs">
                  Restore
                </button>
              </div>
            ))}
            {!deletedRows.length && <div className="py-2 text-xs text-text-muted">Nothing deleted.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
