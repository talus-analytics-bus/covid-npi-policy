import React, { FC, ReactElement, useEffect, useState } from "react";
import styles from "./loadingspinner.module.scss";

// assets
import loadingImg from "./assets/images/loading.gif";
import classNames from "classnames";

type ComponentProps = {
  delay?: number;
  style?: Record<string, any>;
  children?: ReactElement;
  ready?: boolean;
  right?: boolean;
};
export const LoadingSpinner: FC<ComponentProps> = ({
  delay = 0,
  style = {},
  children = null,
  ready = false,
  right = false,
}) => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  useEffect(() => {
    setTimeout(() => setDelayIsOver(true), delay);
  }, []);
  if (delayIsOver)
    return (
      <div
        style={style}
        className={classNames(styles.loadingSpinner, {
          [styles.rightSide]: right,
          [styles.leftSide]: !right,
        })}
      >
        <img
          className={classNames(styles.spinnerImage, {
            [styles.hidden]: ready,
          })}
          src={loadingImg}
          alt="Loading spinner"
        />
        <div
          className={classNames(styles.children, {
            [styles.hidden]: !ready,
          })}
        >
          {ready && children}
        </div>
      </div>
    );
  else return null;
};
export default LoadingSpinner;
