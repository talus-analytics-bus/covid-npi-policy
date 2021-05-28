import classNames from "classnames";
import React, { FC, ReactElement } from "react";
import styles from "./MapPanel.module.scss";

/**
 * Caret props type
 */
type CaretProps = {
  up: boolean;
};

/**
 *
 * @param {Object} o Parameters object
 * @param {boolean} o.up True if caret is facing up, false if down
 * @returns {ReactElement} A caret
 */
export const Caret: FC<CaretProps> = ({ up }): ReactElement => {
  return (
    <i
      className={classNames(styles.caret, "material-icons", {
        [styles.up]: up,
      })}
    >
      play_arrow
    </i>
  );
};
