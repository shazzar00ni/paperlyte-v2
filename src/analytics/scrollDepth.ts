/**
 * Scroll depth tracking
 *
 * Monitors how far users scroll down the page to measure engagement.
 * Tracks 25%, 50%, 75%, and 100% scroll milestones with throttling
 * to prevent excessive event firing.
 */

import type { ScrollDepth } from './types'

/**
 * Callback function for scroll depth events
 */
type ScrollCallback = (depth: ScrollDepth) => void

/**
 * Scroll depth tracker
 * Monitors scroll position and reports milestones
 */
export class ScrollDepthTracker {
  private callback: ScrollCallback
  private trackedDepths: Set<ScrollDepth> = new Set()
  private throttleTimeout: ReturnType<typeof setTimeout> | null = null
  private isEnabled = false

  /**
   * Scroll depth milestones to track (in percentages)
   */
  private readonly depths: ScrollDepth[] = [25, 50, 75, 100]

  constructor(callback: ScrollCallback) {
    this.callback = callback
  }

  /**
   * Initialize scroll depth tracking
   * Attaches scroll event listener with throttling
   */
  init(): void {
    if (this.isEnabled || typeof window === 'undefined') {
      return
    }

    this.isEnabled = true
    window.addEventListener('scroll', this.handleScroll, { passive: true })

    // Check initial scroll position (in case user refreshes mid-page)
    this.checkScrollDepth()
  }

  /**
   * Handle scroll event with throttling
   * Prevents excessive calculations and event firing
   */
  private handleScroll = (): void => {
    if (this.throttleTimeout !== null) {
      return
    }

    this.throttleTimeout = setTimeout(() => {
      this.checkScrollDepth()
      this.throttleTimeout = null
    }, 250) // Throttle to max 4 checks per second
  }

  /**
   * Calculate current scroll depth and check for milestones
   */
  private checkScrollDepth(): void {
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    const scrollTop = window.scrollY || document.documentElement.scrollTop

    // Calculate scroll percentage
    const scrollableHeight = scrollHeight - clientHeight
    const scrollPercentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0

    // Check each milestone
    for (const depth of this.depths) {
      // If we've reached this depth and haven't tracked it yet
      if (scrollPercentage >= depth && !this.trackedDepths.has(depth)) {
        this.trackedDepths.add(depth)
        this.callback(depth)
      }
    }

    // If all depths are tracked, we can stop listening
    if (this.trackedDepths.size === this.depths.length) {
      this.disable()
    }
  }

  /**
   * Disable scroll depth tracking
   * Removes event listener and cleans up
   */
  disable(): void {
    if (!this.isEnabled) {
      return
    }

    this.isEnabled = false
    window.removeEventListener('scroll', this.handleScroll)

    if (this.throttleTimeout !== null) {
      clearTimeout(this.throttleTimeout)
      this.throttleTimeout = null
    }
  }

  /**
   * Reset tracked depths
   * Useful for single-page applications when navigating between pages
   */
  reset(): void {
    this.trackedDepths.clear()
    if (!this.isEnabled) {
      this.init()
    }
  }

  /**
   * Get tracked depths
   * Returns array of scroll depths that have been tracked
   */
  getTrackedDepths(): ScrollDepth[] {
    return Array.from(this.trackedDepths).sort((a, b) => a - b)
  }

  /**
   * Check if tracking is complete
   */
  isComplete(): boolean {
    return this.trackedDepths.size === this.depths.length
  }
}

/**
 * Create and initialize a scroll depth tracker
 *
 * @param callback - Function to call when scroll milestones are reached
 * @returns ScrollDepthTracker instance
 */
export function createScrollTracker(callback: ScrollCallback): ScrollDepthTracker {
  const tracker = new ScrollDepthTracker(callback)
  tracker.init()
  return tracker
}
