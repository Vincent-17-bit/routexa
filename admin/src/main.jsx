import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './lib/theme'
import PinGate from './components/auth/PinGate'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <PinGate>
        <App />
      </PinGate>
    </ThemeProvider>
  </React.StrictMode>
)
