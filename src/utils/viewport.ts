/**
 * Viewport utilities for mobile responsive optimization
 * Handles iOS Safari viewport height issues and other mobile-specific concerns
 */

/**
 * Fix for iOS Safari 100vh issue
 * iOS Safari includes the address bar in viewport height calculations,
 * causing layout issues when the address bar appears/disappears.
 *
 * This sets a custom CSS variable --vh that represents 1% of the actual viewport height
 * Usage in CSS: height: calc(var(--vh, 1vh) * 100)
 */
export function setViewportHeight(): void {
  // Calculate 1% of viewport height
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

/**
 * Initialize viewport height fix
 * Sets initial height and updates on resize/orientation change
 *
 * Note: We intentionally do NOT listen to scroll events despite iOS Safari's
 * address bar behavior. The scroll listener would fire hundreds of times per
 * second, causing severe performance issues on mobile devices. The resize event
 * should fire when the viewport height changes due to the address bar, and this
 * provides sufficient coverage with much better performance.
 *
 * Returns a cleanup function that removes all event listeners.
 */
export function initViewportHeightFix(): () => void {
  // Set initial viewport height
  setViewportHeight()

  // Update on resize (debounced to prevent excessive calculations)
  let resizeTimeout: number

  const handleResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(setViewportHeight, 100)
  }

  const handleOrientationChange = () => {
    // Delay to allow browser to recalculate viewport after orientation change
    setTimeout(setViewportHeight, 100)
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleOrientationChange)

  // Return cleanup function to remove listeners and clear timeout
  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
    clearTimeout(resizeTimeout)
  }
}

/**
 * Detect if device is iOS
 */
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ detection
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 0)
  )
}

/**
 * Detect if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

/**
 * Detect if device is mobile
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid() || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Get safe area insets for notched devices
 * Returns the safe area inset values if supported, otherwise returns zeros
 */
export function getSafeAreaInsets(): {
  top: number
  right: number
  bottom: number
  left: number
} {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const computedStyle = getComputedStyle(document.documentElement)

  return {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10),
  }
}
