import { Section } from '@components/layout/Section';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import { Icon } from '@components/ui/Icon';
import { FEATURES } from '@constants/features';
import styles from './Features.module.css';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps): React.ReactElement => {
  return (
    <AnimatedElement animation="slideUp" delay={delay} threshold={0.2}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Icon name={icon} size="2x" ariaLabel={`${title} icon`} />
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </AnimatedElement>
  );
};

export const Features = (): React.ReactElement => {
  return (
    <Section id="features" background="surface">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Built for Speed, Designed for Simplicity</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Everything you need for effortless note-taking. Nothing you don't.
          </p>
        </AnimatedElement>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={index * 100}
          />
        ))}
      </div>
    </Section>
  );
};
