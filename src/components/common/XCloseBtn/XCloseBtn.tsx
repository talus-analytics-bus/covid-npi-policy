// 3rd party packages
import React, { FC } from "react";
import CSS from "csstype";
import classNames from "classnames";

// styles and assets
import styles from "./XCloseBtn.module.scss";
import crossSvg from "assets/icons/cross.svg";

interface XCloseBtnProps {
  onClick?(...args: any[]): void;
  title?: string;
  style?: CSS.Properties;
  show?: boolean;
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
  show = true,
}) => {
  return (
    <button
      className={classNames(styles.xCloseBtn, { [styles.show]: show })}
      style={{ backgroundImage: `url(${crossSvg})`, ...style }}
      type="button"
      {...{ onClick, title }}
    ></button>
  );
};

export default XCloseBtn;
