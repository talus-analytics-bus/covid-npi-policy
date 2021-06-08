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

  /**
   * If true, fadeout is always instantaneous
   */
  instantFadeout?: boolean;

  /**
   * Inline CSS for children container
   */
  childrenStyle?: Record<string, any>;
};
export const LoadingSpinner: FC<ComponentProps> = ({
  delay = 0,
  style = {},
  childrenStyle = {},
  text,
  children = null,
  ready = false,
  right = false,
  fill = false,
  instantFadeout = true,
}) => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  useEffect(() => {
    setDelayIsOver(false);
    setTimeout(() => setDelayIsOver(true), delay);
  }, [delay, ready]);

  return (
    <div
      style={style}
      className={classNames(styles.loadingSpinner, {
        [styles.rightSide]: right,
        [styles.leftSide]: !right,
        [styles.fill]: fill,
        [styles.instantFadeout]: instantFadeout,
      })}
    >
      <div
        className={classNames(styles.spinnerImageAndText, {
          [styles.hidden]: ready || !delayIsOver,
        })}
      >
        <img
          className={styles.spinnerImage}
          src={loadingImg}
          alt="Loading spinner"
        />
        {text && <div className={styles.text}>{text}</div>}
      </div>
      <div
        style={childrenStyle}
        className={classNames(styles.children, {
          [styles.hidden]: !ready,
          [styles.instantFadeout]: instantFadeout,
          [styles.displayed]: children !== null && children !== undefined,
        })}
      >
        {children}
      </div>
    </div>
  );
};
export default LoadingSpinner;
