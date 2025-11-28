/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Primary colors - Purple palette
        primary: {
          DEFAULT: '#7C3AED',  // Purple 600
          dark: '#6D28D9',     // Purple 700
          light: '#A78BFA',    // Purple 400
          faint: 'rgba(124, 58, 237, 0.1)',
          fainter: 'rgba(124, 58, 237, 0.05)',
        },
        // Background colors
        background: {
          DEFAULT: '#FFFFFF',  // Light mode
          dark: '#0F172A',     // Dark mode - Slate 900
        },
        surface: {
          DEFAULT: '#F9FAFB',  // Light mode - Gray 50
          dark: '#1E293B',     // Dark mode - Slate 800
        },
        // Text colors
        text: {
          primary: {
            DEFAULT: '#111827',  // Light mode - Gray 900
            dark: '#F1F5F9',     // Dark mode - Slate 100
          },
          secondary: {
            DEFAULT: '#6B7280',  // Light mode - Gray 500
            dark: '#94A3B8',     // Dark mode - Slate 400
          },
          'on-primary': '#FFFFFF',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',  // Light mode - Gray 200
          dark: '#334155',     // Dark mode - Slate 700
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
        '3xl': '6rem',  // 96px
      },
      maxWidth: {
        container: '1280px',
        content: '1024px',
      },
      borderRadius: {
        sm: '0.25rem',  // 4px
        md: '0.5rem',   // 8px
        lg: '1rem',     // 16px
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        header: '1000',
        modal: '2000',
        tooltip: '3000',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 250ms ease-out',
        slideUp: 'slideUp 350ms ease-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
