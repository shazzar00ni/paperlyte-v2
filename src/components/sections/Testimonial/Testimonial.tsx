import React from "react";
import styles from "./Testimonial.module.css";

export const Testimonial: React.FC = () => {
  return (
    <section className={styles.testimonial}>
      <div className={styles.container}>
        <div className={styles.quoteMark}>"</div>
        <blockquote className={styles.quote}>
          I've tried every note-taking app out there. This is the only one that
          actually helps me think clearer, not just store information.
        </blockquote>
        <div className={styles.author}>
          <div className={styles.name}>Sarah Jenkins</div>
          <div className={styles.role}>Creative Director at Studio M</div>
        </div>
      </div>
    </section>
  );
};
