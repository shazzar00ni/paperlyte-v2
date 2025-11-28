import type React from 'react';
import { useTheme } from '@hooks/useTheme';
import { Icon } from '@components/ui/Icon';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = (): React.ReactElement => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Icon name="fa-moon" size="md" />
      ) : (
        <Icon name="fa-sun" size="md" />
      )}
    </button>
  );
};
