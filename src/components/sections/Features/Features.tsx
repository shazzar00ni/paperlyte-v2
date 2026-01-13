import React from "react";
import styles from "./Features.module.css";

export const Features: React.FC = () => {
  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className={styles.title}>Distraction-free Writing</h3>
            <p className={styles.description}>
              An interface that disappears when you start typing. Just you and
              your thoughts.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 11V7a5 5 0 0110 0v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className={styles.title}>Private by Design</h3>
            <p className={styles.description}>
              Local-first architecture with optional end-to-end encrypted sync.
              Your data is yours.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className={styles.title}>Seamless Workflow</h3>
            <p className={styles.description}>
              Quick capture, markdown support, and keyboard shortcuts for power
              users.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
