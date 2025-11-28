// Lightweight SVG icon paths to replace Font Awesome CDN
// Only includes icons actually used in the app

export const iconPaths: Record<string, string> = {
  // Logo & Brand
  'fa-feather': 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9',
  'fa-github': 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  'fa-twitter': 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  'fa-envelope': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',

  // Theme
  'fa-moon': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  'fa-sun': 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',

  // Hero tags & Features
  'fa-bolt': 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
  'fa-lock': 'M19 11h-1V7c0-2.8-2.2-5-5-5S8 4.2 8 7v4H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-7 0V7c0-1.7 1.3-3 3-3s3 1.3 3 3v4h-6z',
  'fa-wifi-slash': 'M1 1l22 22 M16.72 11.06A10.94 10.94 0 0 1 19 12.55 M5 12.55a10.94 10.94 0 0 1 5.17-2.39 M10.71 5.05A16 16 0 0 1 22.58 9 M1.42 9a15.91 15.91 0 0 1 4.7-2.88 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
  'fa-pen-nib': 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586',
  'fa-tags': 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  'fa-mobile-screen': 'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M12 18h.01',
  'fa-shield-halved': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 2v20',

  // UI States
  'fa-triangle-exclamation': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  'fa-circle-check': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  'fa-spinner': 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
  'fa-circle-exclamation': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01',

  // Buttons (via Button component icon prop)
  'fa-download': 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  'fa-apple': 'M12 20.94c1.5 0 2.75 1.06 4.5 2.03V21c0-.5-.5-1-.5-1s-1.5-.5-4-.5-4 .5-4 .5-.5.5-.5 1v2c1.75-1 3-2.03 4.5-2.03z M12 12a6.5 6.5 0 0 1-6.5-6.5A6.5 6.5 0 0 1 12 0a6.5 6.5 0 0 1 6.5 6.5A6.5 6.5 0 0 1 12 12z',
  'fa-windows': 'M0 3.45L8.73 2.2v8.45H0V3.45zm8.73 8.35v8.45L0 19.05v-7.25h8.73zM9.82 2L23 0v10.66H9.82V2zm0 10.66H23V24l-13.18-2V12.66z',
};

// Icon viewBox configurations (most use 0 0 24 24, but some may differ)
export const iconViewBox: Record<string, string> = {
  'fa-apple': '0 0 24 24',
  'fa-windows': '0 0 23 24',
  // Default for all others
};

export const getIconViewBox = (name: string): string => {
  return iconViewBox[name] || '0 0 24 24';
};
