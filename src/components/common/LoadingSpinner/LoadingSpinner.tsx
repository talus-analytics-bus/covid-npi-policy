import React, { FC, useEffect, useState } from "react";
import styles from "./loadingspinner.module.scss";

// assets
import loadingImg from "./assets/images/loading.gif";

type ComponentProps = {
  delay?: number;
};
export const LoadingSpinner: FC<ComponentProps> = ({ delay = 0 }) => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  useEffect(() => {
    setTimeout(() => setDelayIsOver(true), delay);
  }, []);
  if (delayIsOver)
    return (
      <div className={styles.loadingSpinner}>
        <img src={loadingImg} alt="Loading spinner" />
      </div>
    );
  else return null;
};
export default LoadingSpinner;
