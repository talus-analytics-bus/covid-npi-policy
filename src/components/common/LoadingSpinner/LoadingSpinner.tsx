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

  /**
   * True if spinner fills container and centers inside
   */
  fill?: boolean;

  /**
   * If any, text shown with spinner
   */
  text?: string;
};
export const LoadingSpinner: FC<ComponentProps> = ({
  delay = 0,
  style = {},
  text,
  children = null,
  ready = false,
  right = false,
  fill = false,
}) => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  useEffect(() => {
    setDelayIsOver(false);
    setTimeout(() => setDelayIsOver(true), delay);
  }, [delay, ready]);
  if (delayIsOver)
    return (
      <div
        style={style}
        className={classNames(styles.loadingSpinner, {
          [styles.rightSide]: right,
          [styles.leftSide]: !right,
          [styles.fill]: fill,
        })}
      >
        <div
          className={classNames(styles.spinnerImageAndText, {
            [styles.hidden]: ready,
          })}
        >
          <img
            className={styles.spinnerImage}
            src={loadingImg}
            alt="Loading spinner"
          />
          {text && <div className={styles.text}>{text}</div>}
        </div>
        {children && (
          <div
            className={classNames(styles.children, {
              [styles.hidden]: !ready,
            })}
          >
            {ready && children}
          </div>
        )}
      </div>
    );
  else return null;
};
export default LoadingSpinner;
