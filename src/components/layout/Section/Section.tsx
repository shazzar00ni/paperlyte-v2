import { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: 'default' | 'surface' | 'primary';
  padding?: 'default' | 'large' | 'none';
}

export const Section: React.FC<SectionProps> = ({
  id,
  children,
  className = '',
  background = 'default',
  padding = 'default',
}) => {
  const classNames = [
    styles.section,
    styles[`bg-${background}`],
    styles[`padding-${padding}`],
    className,
  ].join(' ');

  return (
    <section id={id} className={classNames}>
      <div className={styles.container}>{children}</div>
    </section>
  );
};
