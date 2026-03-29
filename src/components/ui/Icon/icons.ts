import { safePropertyAccess } from '@utils/security'

// Lightweight SVG icon paths to replace Font Awesome CDN
// Only includes icons actually used in the app

export const iconPaths: Record<string, string> = {
  // Logo & Brand
  'fa-feather': 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9',
  'fa-github':
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  'fa-twitter':
    'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  'fa-envelope':
    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',

  // Theme
  'fa-moon': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  'fa-sun':
    'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',

  // Hero tags & Features
  'fa-bolt': 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
  'fa-lock':
    'M19 11h-1V7c0-2.8-2.2-5-5-5S8 4.2 8 7v4H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-7 0V7c0-1.7 1.3-3 3-3s3 1.3 3 3v4h-6z',
  'fa-wifi-slash':
    'M1 1l22 22 M16.72 11.06A10.94 10.94 0 0 1 19 12.55 M5 12.55a10.94 10.94 0 0 1 5.17-2.39 M10.71 5.05A16 16 0 0 1 22.58 9 M1.42 9a15.91 15.91 0 0 1 4.7-2.88 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
  'fa-pen-nib': 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586',
  'fa-tags':
    'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  'fa-mobile-screen':
    'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M12 18h.01',
  'fa-shield-halved': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 2v20',

  // Navigation
  'fa-home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',

  // UI States
  'fa-triangle-exclamation':
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  'fa-circle-check': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  'fa-spinner':
    'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
  'fa-circle-exclamation':
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01',

  // Buttons (via Button component icon prop)
  'fa-download': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  'fa-arrow-right': 'M5 12h14 M12 5l7 7-7 7',
  'fa-apple':
    'M12 20.94c1.5 0 2.75 1.06 4.5 2.03V21c0-.5-.5-1-.5-1s-1.5-.5-4-.5-4 .5-4 .5-.5.5-.5 1v2c1.75-1 3-2.03 4.5-2.03z M12 12a6.5 6.5 0 0 1-6.5-6.5A6.5 6.5 0 0 1 12 0a6.5 6.5 0 0 1 6.5 6.5A6.5 6.5 0 0 1 12 12z',
  'fa-windows':
    'M0 3.45L8.73 2.2v8.45H0V3.45zm8.73 8.35v8.45L0 19.05v-7.25h8.73zM9.82 2L23 0v10.66H9.82V2zm0 10.66H23V24l-13.18-2V12.66z',

  // Feedback Widget Icons
  'fa-comment-dots':
    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z M12 11h.01 M8 11h.01 M16 11h.01',
  'fa-x': 'M18 6L6 18 M6 6l12 12',
  'fa-bug':
    'M8 2v4 M16 2v4 M12 14v1 M2 9h4 M18 9h4 M2 15h4 M18 15h4 M8 2.5c.5-.3 1.2-.5 2-.5h4c.8 0 1.5.2 2 .5 M6 8c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4V8z',
  'fa-lightbulb': 'M9 18h6 M10 22h4 M15 8a3 3 0 0 0-6 0c0 2 2 3 2 5v1h2v-1c0-2 2-3 2-5z M12 2v1',
  'fa-paper-plane': 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',

  // Navigation & UI Controls
  'fa-bars': 'M3 12h18 M3 6h18 M3 18h18',
  'fa-xmark': 'M18 6L6 18 M6 6l12 12',
  'fa-chevron-left': 'M15 18l-6-6 6-6',
  'fa-chevron-right': 'M9 18l6-6-6-6',
  'fa-chevron-up': 'M18 15l-6-6-6 6',
  'fa-chevron-down': 'M6 9l6 6 6-6',
  'fa-arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
  'fa-check': 'M20 6L9 17l-5-5',
  'fa-check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  'fa-house': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  'fa-circle-info':
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
  'fa-clock':
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  'fa-rotate-right':
    'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  'fa-arrow-rotate-right': 'M21 2v6h-6 M3.51 9a9 9 0 1 1-.49 3',
  'fa-arrow-rotate-left': 'M3 4v6h6 M20.49 15a9 9 0 1 0-2.12-9.36L3 10',
  'fa-magnifying-glass': 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  'fa-code': 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  'fa-book':
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  'fa-pen': 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  'fa-file-circle-question':
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 17v.01 M12 11a2 2 0 0 1 1.73 3',

  // Stats & Metrics
  'fa-star':
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'fa-users':
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'fa-server':
    'M2 3h20a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M2 11h20a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z M5 7h.01 M5 15h.01',
  'fa-note-sticky': 'M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l5-5V5a2 2 0 0 0-2-2H7z M17 3v6h5',

  // Pricing Plan Icons
  'fa-leaf': 'M2 2l8 8a7 7 0 1 0 10-10A15 15 0 0 0 2 2 M2 22l8-8',
  'fa-rocket':
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',

  // Offline / Error State Icons
  'fa-wifi':
    'M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
  'fa-plane':
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.55 5.55l.92-.92a2 2 0 0 1 2.12-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  'fa-route':
    'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7',

  // Social Media Brand Icons
  'fa-x-twitter': 'M4 4l16 16 M20 4L4 20',
  'fa-instagram':
    'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z',
  'fa-facebook': 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  'fa-linkedin':
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'fa-globe':
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
}

// Icon viewBox configurations (most use 0 0 24 24, but some may differ)
export const iconViewBox: Record<string, string> = {
  'fa-apple': '0 0 24 24',
  'fa-windows': '0 0 23 24',
}

// Returns the viewBox for the given icon, defaulting to "0 0 24 24" for icons not listed above
export const getIconViewBox = (name: string): string => {
  return safePropertyAccess(iconViewBox, name) ?? '0 0 24 24'
}

/**
 * Icons that use closed shapes requiring fill="none" on path elements
 * so that the stroke renders correctly without the fill obscuring it.
 * Add icon names here when the path data describes a closed filled shape
 * that should appear as an outline only.
 */
export const strokeOnlyIcons = new Set<string>([
  'fa-circle-check',
  'fa-circle-exclamation',
  'fa-check-circle',
  'fa-shield-halved',
  'fa-circle-info',
  'fa-clock',
  'fa-wifi',
  'fa-note-sticky',
])
