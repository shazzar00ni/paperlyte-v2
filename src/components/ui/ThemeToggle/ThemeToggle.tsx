import type { ReactElement } from 'react'
import { useTheme } from '@hooks/useTheme'
import { Icon } from '@components/ui/Icon'
import styles from './ThemeToggle.module.css'

export const ThemeToggle = (): ReactElement => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Icon is decorative - button's aria-label provides accessible name */}
      {theme === 'light' ? <Icon name="fa-moon" size="md" /> : <Icon name="fa-sun" size="md" />}
    </button>
  )
}
