import classNames from "classnames";
import React, { FC, ReactElement } from "react";
import styles from "./Caret.module.scss";
import CSS from "csstype";

/**
 * Caret props
 */
interface CaretProps {
  up: boolean;
  style?: CSS.Properties;
}

/**
 *
 * @param {Object} o Parameters object
 * @param {boolean} o.up True if caret is facing up, false if down
 * @returns {ReactElement} A caret
 */
export const Caret: FC<CaretProps> = ({ up, style }): ReactElement => {
  return (
    <i
      className={classNames(styles.caret, "material-icons", {
        [styles.up]: up,
      })}
      {...{ style }}
    >
      play_arrow
    </i>
  );
};
export default Caret;
