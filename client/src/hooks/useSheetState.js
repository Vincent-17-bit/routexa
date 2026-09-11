import { useCallback, useEffect, useRef, useState } from 'react'

export const SHEET_STATE = { IDLE: 1, PREVIEW: 2, FULL: 3 }

const HEIGHT_PX = { [SHEET_STATE.IDLE]: 52, [SHEET_STATE.PREVIEW]: 180 }

function heightForState(state) {
  if (state === SHEET_STATE.FULL) return window.innerHeight * 0.8
  return HEIGHT_PX[state]
}

export function useSheetState() {
  const [state, setState] = useState(SHEET_STATE.IDLE)
  const dragStartY = useRef(null)

  useEffect(() => {
    document.documentElement.style.setProperty('--sheet-height', `${heightForState(state)}px`)
  }, [state])

  const onTouchStart = useCallback((e) => {
    dragStartY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e) => {
    if (dragStartY.current === null) return
    e.preventDefault()
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (dragStartY.current === null) return
    const deltaY = e.changedTouches[0].clientY - dragStartY.current
    const THRESHOLD = 40

    if (deltaY < -THRESHOLD) {
      setState((s) => Math.min(s + 1, SHEET_STATE.FULL))
    } else if (deltaY > THRESHOLD) {
      setState((s) => Math.max(s - 1, SHEET_STATE.IDLE))
    }
    dragStartY.current = null
  }, [])

  const reset = useCallback(() => setState(SHEET_STATE.IDLE), [])

  return { state, setState, reset, dragHandlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
