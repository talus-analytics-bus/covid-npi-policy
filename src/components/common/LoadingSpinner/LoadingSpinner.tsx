import React, { FC, ReactElement, useEffect, useState } from "react";
import styles from "./loadingspinner.module.scss";

// assets
import loadingImg from "./assets/images/loading.svg";
// import loadingImg from "./assets/images/loading.gif";
import classNames from "classnames";

interface LoadingSpinnerProps {
  delay?: number;
  style?: Record<string, any>;
  children?: ReactElement;
  isReady?: boolean;
  right?: boolean;

  /**
   * True if spinner fills container and centers inside
   */
  isFill?: boolean;

  /**
   * True if spinner appears inline, false otherwise.
   */
  inline?: boolean;

  /**
   * True if spinner should be half regular size, false for normal size.
   */
  small?: boolean;

  /**
   * True if spinner fills entire screen and prevents interactions
   */
  fullscreen?: boolean;

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
}
export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  delay = 0,
  style = {},
  childrenStyle = {},
  text,
  children = null,
  isReady: ready = false,
  inline = false,
  small = false,
  right = false,
  isFill: fill = false,
  fullscreen = false,
  instantFadeout = true,
}) => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    setDelayIsOver(false);
    setTimeout(() => setDelayIsOver(true), delay);
  }, [delay, ready]);

  useEffect(() => {
    const rotationTimer = setTimeout(
      (curRotation: number) => {
        // rotate an additional 60deg every sec
        setRotation(curRotation + 60);
      },
      1000,
      rotation
    );

    return () => {
      clearTimeout(rotationTimer);
    };
  }, [rotation]);

  return (
    <div
      style={style}
      className={classNames(styles.loadingSpinner, {
        [styles.rightSide]: right,
        [styles.leftSide]: !right,
        [styles.inline]: inline,
        [styles.small]: small,
        [styles.fill]: fill,
        [styles.fullscreen]: fullscreen,
        [styles.instantFadeout]: instantFadeout,
        [styles.hiddenFullscreen]: fullscreen && (ready || !delayIsOver),
      })}
    >
      <div
        className={classNames(styles.spinnerImageAndText, {
          [styles.hidden]: ready || !delayIsOver,
        })}
      >
        <div
          style={{ transform: `rotate(${rotation}deg)` }}
          className={styles.spinnerImageContainer}
        >
          <img
            className={styles.spinnerImage}
            src={loadingImg}
            alt="Loading spinner"
          />
        </div>
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
