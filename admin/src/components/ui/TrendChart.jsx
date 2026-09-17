import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../lib/theme'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

function todayEAT() {
  return new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10)
}

function peakIndex(values) {
  let idx = -1
  let max = 0
  values.forEach((v, i) => {
    if (v > max) { max = v; idx = i }
  })
  return idx
}

function pointStyling(trend, values, color) {
  const peak = peakIndex(values)
  const today = todayEAT()
  return values.map((_, i) => {
    const isPeak = i === peak
    const isPartial = trend[i].day === today
    return {
      pointStyle: isPeak ? 'star' : 'circle',
      pointRadius: isPeak ? 7 : isPartial ? 4 : 3,
      pointBackgroundColor: isPartial ? 'transparent' : color,
      pointBorderColor: color,
      pointBorderWidth: isPartial ? 2 : 1
    }
  })
}

function mergeStyling(styles) {
  return {
    pointStyle: styles.map((s) => s.pointStyle),
    pointRadius: styles.map((s) => s.pointRadius),
    pointBackgroundColor: styles.map((s) => s.pointBackgroundColor),
    pointBorderColor: styles.map((s) => s.pointBorderColor),
    pointBorderWidth: styles.map((s) => s.pointBorderWidth)
  }
}

export default function TrendChart({ trend }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    const grid = styles.getPropertyValue('--border')
    const text = styles.getPropertyValue('--text-secondary')
    const textPrimary = styles.getPropertyValue('--text-primary')
    const surface = styles.getPropertyValue('--nested')
    const cyan = styles.getPropertyValue('--cyan')
    const green = styles.getPropertyValue('--success')

    const logins = trend.map((r) => r.logins)
    const searches = trend.map((r) => r.searches)

    chartRef.current?.destroy()
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: trend.map((r) => r.day.slice(5)),
        datasets: [
          { label: 'Logins', data: logins, borderColor: cyan, backgroundColor: cyan, tension: 0.25, ...mergeStyling(pointStyling(trend, logins, cyan)) },
          { label: 'Searches', data: searches, borderColor: green, backgroundColor: green, tension: 0.25, ...mergeStyling(pointStyling(trend, searches, green)) }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: text, font: { family: 'JetBrains Mono' } } },
          tooltip: {
            backgroundColor: surface,
            borderColor: grid,
            borderWidth: 1,
            titleColor: textPrimary,
            bodyColor: textPrimary,
            titleFont: { family: 'JetBrains Mono' },
            bodyFont: { family: 'JetBrains Mono' },
            callbacks: {
              afterLabel: (ctx) => {
                const row = trend[ctx.dataIndex]
                const values = ctx.dataset.label === 'Logins' ? logins : searches
                const notes = []
                if (ctx.dataIndex === peakIndex(values) && ctx.parsed.y > 0) notes.push('peak day')
                if (row.day === todayEAT()) notes.push('still counting today')
                return notes.join(' · ')
              }
            }
          }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, font: { family: 'JetBrains Mono' } } },
          y: { grid: { color: grid }, min: 0, ticks: { stepSize: 1, color: text, font: { family: 'JetBrains Mono' } } }
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [trend, theme])

  return (
    <div className="h-64">
      <canvas ref={canvasRef} />
    </div>
  )
}
