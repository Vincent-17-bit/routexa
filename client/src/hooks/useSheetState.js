import { useCallback, useEffect, useRef, useState } from 'react'

export const MIN_SHEET_HEIGHT = 96
export const DEFAULT_SHEET_HEIGHT = 380

function getMaxHeight() {
  return typeof window !== 'undefined' ? window.innerHeight * 0.85 : 640
}

export function useSheetState(isMobile) {
  const [height, setHeightState] = useState(DEFAULT_SHEET_HEIGHT)
  const maxHeightRef = useRef(getMaxHeight())
  const dragStartYRef = useRef(null)
  const dragStartHeightRef = useRef(null)

  useEffect(() => {
    const onResize = () => {
      maxHeightRef.current = getMaxHeight()
      setHeightState((h) => Math.min(h, maxHeightRef.current))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const clamp = useCallback((h) => Math.min(Math.max(h, MIN_SHEET_HEIGHT), maxHeightRef.current), [])

  const setHeight = useCallback((h) => setHeightState(clamp(h)), [clamp])

  useEffect(() => {
    document.documentElement.style.setProperty('--sheet-height', isMobile ? `${height}px` : '0px')
  }, [height, isMobile])

  const onTouchStart = useCallback((e) => {
    dragStartYRef.current = e.touches[0].clientY
    dragStartHeightRef.current = height
  }, [height])

  const onTouchMove = useCallback((e) => {
    if (dragStartYRef.current === null) return
    e.preventDefault()
    const deltaY = dragStartYRef.current - e.touches[0].clientY
    setHeight(dragStartHeightRef.current + deltaY)
  }, [setHeight])

  const onTouchEnd = useCallback(() => {
    dragStartYRef.current = null
    dragStartHeightRef.current = null
  }, [])

  const collapse = useCallback(() => setHeight(MIN_SHEET_HEIGHT), [setHeight])
  const expand = useCallback(() => setHeight(maxHeightRef.current), [setHeight])
  const ensureVisible = useCallback(() => setHeightState((h) => clamp(Math.max(h, DEFAULT_SHEET_HEIGHT))), [clamp])
  const reset = useCallback(() => setHeightState(DEFAULT_SHEET_HEIGHT), [])

  const isCollapsed = height <= MIN_SHEET_HEIGHT + 4

  return {
    height,
    isCollapsed,
    setHeight,
    collapse,
    expand,
    ensureVisible,
    reset,
    dragHandlers: { onTouchStart, onTouchMove, onTouchEnd }
  }
}
