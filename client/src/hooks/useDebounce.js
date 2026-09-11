import { useRef, useCallback } from 'react'

export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef(null)

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}
