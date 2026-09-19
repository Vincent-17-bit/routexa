import { useEffect, useRef, useState } from 'react'

const PIN = '8127'
const STORAGE_KEY = 'routexa-admin-unlocked'

const DARK_VARS = {
  '--page': '#0A0F16',
  '--surface': '#0E1620',
  '--nested': '#111B27',
  '--border': '#1C2833',
  '--text-primary': '#E7EDF3',
  '--text-secondary': '#8493A3',
  '--text-muted': '#56606C',
  '--cyan': '#22D3EE',
  '--cyan-bg': '#0B2530',
  '--danger': '#F87171',
  '--danger-bg': '#2A1414'
}

export default function PinGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1')
  const [welcoming, setWelcoming] = useState(false)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!unlocked) inputRefs.current[0]?.focus()
  }, [unlocked])

  if (unlocked) return children

  const submit = (code) => {
    if (code === PIN) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setWelcoming(true)
      setTimeout(() => setUnlocked(true), 1100)
    } else {
      setError(true)
      setDigits(['', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleChange = (i, raw) => {
    const value = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = value
    setDigits(next)
    setError(false)

    if (value && i < 3) {
      inputRefs.current[i + 1]?.focus()
    } else if (value && i === 3) {
      submit(next.join(''))
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  return (
    <div style={DARK_VARS} className="min-h-screen w-full flex items-center justify-center bg-page px-4 font-mono">
      <div className="w-full max-w-xs rounded-xl border-[0.5px] border-border bg-surface p-6">
        {welcoming ? (
          <div className="py-6 text-center">
            <p className="text-sm text-text-secondary">Welcome back,</p>
            <p className="mt-1 text-lg text-cyan">@_viniihkr3</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-sm text-text-primary">ROUTEXA <span className="text-cyan">admin</span></p>
              <p className="mt-1 text-xs text-text-secondary">Enter PIN to continue</p>
            </div>
            <div className="flex justify-center gap-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`PIN digit ${i + 1}`}
                  className={`h-12 w-12 rounded-lg border-[0.5px] bg-nested text-center text-lg text-text-primary outline-none focus:border-cyan ${
                    error ? 'border-danger' : 'border-border'
                  }`}
                />
              ))}
            </div>
            {error && <p className="mt-4 text-center text-xs text-danger">Incorrect PIN</p>}
          </>
        )}
      </div>
    </div>
  )
}
