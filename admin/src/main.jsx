import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { checkHealth } from './lib/api'

function App() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    checkHealth()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <p>ROUTEXA Admin — scaffold pending</p>
      <p>Server: {status}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
