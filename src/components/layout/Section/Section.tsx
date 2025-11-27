import { type ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: 'default' | 'surface' | 'primary';
  padding?: 'default' | 'large' | 'none';
}

export const Section = ({
  id,
  children,
  className = '',
  background = 'default',
  padding = 'default',
}: SectionProps): React.ReactElement => {
  const classNames = [
    styles.section,
    styles[`bg-${background}`],
    styles[`padding-${padding}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section id={id} className={classNames}>
      <div className={styles.container}>{children}</div>
    </section>
  );
};
