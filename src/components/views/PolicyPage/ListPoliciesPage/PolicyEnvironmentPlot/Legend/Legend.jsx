import React from "react";

import styles from "./Legend.module.scss";

const Legend = () => (
  <div className={styles.container}>
    <div className={styles.entry}>
      <svg
        className={styles.key}
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className={styles.averageLine} d={"M 2 5 L 8 5"} />
      </svg>
      <span className={styles.label}>7-day moving average</span>
    </div>
    <div className={styles.entry}>
      <svg
        className={styles.key}
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={5}
          cy={5}
          r={5}
          style={{ fill: "rgba(64, 147, 132, .5)" }}
        />
      </svg>
      <span className={styles.label}>
        Policies that went into effect on this date
      </span>
    </div>
  </div>
);

export default Legend;
