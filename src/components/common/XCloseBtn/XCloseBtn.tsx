// 3rd party packages
import React, { FC } from "react";
import CSS from "csstype";

// styles and assets
import styles from "./XCloseBtn.module.scss";
import crossSvg from "assets/icons/cross.svg";

interface XCloseBtnProps {
  onClick?(...args: any[]): void;
  title?: string;
  style?: CSS.Properties;
}

/**
 * A simple X close button
 * @param param0 XCloseBtn properties
 * @returns The simple X close button
 */
export const XCloseBtn: FC<XCloseBtnProps> = ({
  onClick,
  title = "Close",
  style = {},
}) => {
  return (
    <button
      className={styles.xCloseBtn}
      style={{ backgroundImage: `url(${crossSvg})`, ...style }}
      type="button"
      {...{ onClick, title }}
    ></button>
  );
};

export default XCloseBtn;
