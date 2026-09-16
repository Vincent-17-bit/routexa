import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../lib/theme'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

export default function TrendChart({ trend }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    const grid = styles.getPropertyValue('--border')
    const text = styles.getPropertyValue('--text-secondary')
    const cyan = styles.getPropertyValue('--cyan')
    const green = styles.getPropertyValue('--success')

    chartRef.current?.destroy()
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: trend.map((r) => r.day.slice(5)),
        datasets: [
          { label: 'Logins', data: trend.map((r) => r.logins), borderColor: cyan, backgroundColor: cyan, tension: 0.25 },
          { label: 'Searches', data: trend.map((r) => r.searches), borderColor: green, backgroundColor: green, tension: 0.25 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: text, font: { family: 'JetBrains Mono' } } } },
        scales: {
          x: { grid: { color: grid }, ticks: { color: text, font: { family: 'JetBrains Mono' } } },
          y: { grid: { color: grid }, ticks: { color: text, font: { family: 'JetBrains Mono' } } }
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
