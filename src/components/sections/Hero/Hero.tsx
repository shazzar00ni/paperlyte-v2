
import styles from "./Hero.module.css";

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.sparkle}>✨</span> Version 2.0 is now live
          </div>
          <h1 className={styles.title}>
            Thoughts,
            <br />
            <span className={styles.italic}>organized.</span>
          </h1>
          <p className={styles.description}>
            The minimal workspace for busy professionals. Capture ideas,
            structure documents, and focus on what truly matters—without the
            clutter.
          </p>
          <div className={styles.actions}>
            <button className={styles.primaryBtn}>
              Start Writing for Free <span className={styles.arrow}>→</span>
            </button>
            <button className={styles.secondaryBtn}>View the Demo</button>
          </div>
        </div>
        <div className={styles.visual}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.dot}></div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.skeletonBlock}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>

              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <div className={styles.checkbox}></div>
                  <div className={styles.lineSmall}></div>
                </div>
                <div className={styles.checkboxItem}>
                  <div className={styles.checkbox}></div>
                  <div className={styles.lineSmall}></div>
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>PRODUCTIVITY</span>
                <span className={styles.statValue}>+120%</span>
                <span className={styles.statDesc}>
                  Focus increase reported by users
                </span>
              </div>
              <button className={styles.shareBtn}>Share</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
