import classNames from "classnames";
import React, { FC, ReactElement, useEffect, useState } from "react";
import styles from "./Skeletons.module.scss";

export interface RectSkeletonProps {
  ready: boolean;
  shiny?: boolean;
  children?: ReactElement;
  placeholder?: ReactElement;
  customStyle?: Record<string, any>;
  delay?: number;
}
export const RectSkeleton: FC<RectSkeletonProps> = ({
  children,
  placeholder,
  shiny = true,
  ready = true,
  customStyle = {},
  delay = 0,
}): ReactElement | null => {
  const [delayIsOver, setDelayIsOver] = useState(delay === 0);
  useEffect(() => {
    setDelayIsOver(false);
    setTimeout(() => setDelayIsOver(true), delay);
  }, [delay, ready]);

  if (delayIsOver)
    return (
      <div
        style={customStyle}
        className={classNames(styles.rectSkeleton, {
          [styles.ready]: ready,
          [styles.shiny]: !ready && shiny,
        })}
      >
        {!ready && placeholder}
        {ready && children}
      </div>
    );
  else return null;
};

export default RectSkeleton;
