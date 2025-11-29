import { useState } from 'react';
import { Section } from '@components/layout/Section';
import { AnimatedElement } from '@components/ui/AnimatedElement';
import { Icon } from '@components/ui/Icon';
import { FAQ_ITEMS } from '@constants/faq';
import styles from './FAQ.module.css';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}

const FAQItemComponent = ({ question, answer, isOpen, onToggle, delay }: FAQItemProps): React.ReactElement => {
  return (
    <AnimatedElement animation="slideUp" delay={delay}>
      <article className={styles.item}>
        <button
          className={styles.question}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className={styles.questionText}>{question}</span>
          <Icon
            name={isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}
            size="sm"
            color="var(--color-primary)"
            ariaLabel={isOpen ? 'Collapse answer' : 'Expand answer'}
          />
        </button>
        <div
          id={`answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
          className={`${styles.answer} ${isOpen ? styles.answerOpen : ''}`}
          aria-hidden={!isOpen}
        >
          <p className={styles.answerText}>{answer}</p>
        </div>
      </article>
    </AnimatedElement>
  );
};

export const FAQ = (): React.ReactElement => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Section id="faq" background="default">
      <div className={styles.header}>
        <AnimatedElement animation="fadeIn">
          <h2 className={styles.title}>Frequently Asked Questions</h2>
        </AnimatedElement>
        <AnimatedElement animation="fadeIn" delay={100}>
          <p className={styles.subtitle}>
            Everything you need to know about Paperlyte. Can't find an answer?{' '}
            <a href="#contact" className={styles.link}>
              Contact our support team
            </a>
            .
          </p>
        </AnimatedElement>
      </div>

      <div className={styles.grid}>
        {FAQ_ITEMS.map((item, index) => (
          <FAQItemComponent
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.has(item.id)}
            onToggle={() => toggleItem(item.id)}
            delay={150 + index * 50}
          />
        ))}
      </div>

      <AnimatedElement animation="fadeIn" delay={700}>
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Still have questions? Check out our{' '}
            <a href="#help" className={styles.link}>
              Help Center
            </a>{' '}
            or{' '}
            <a href="#community" className={styles.link}>
              Community Forum
            </a>
            .
          </p>
        </div>
      </AnimatedElement>
    </Section>
  );
};
