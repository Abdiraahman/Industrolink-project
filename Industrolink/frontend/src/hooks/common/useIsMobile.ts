import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * @returns {boolean} True if viewport width is less than 768px, false otherwise
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false
    }
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  useEffect(() => {
    // Early return if not in browser environment (SSR safety)
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches)
    }

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Add event listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}