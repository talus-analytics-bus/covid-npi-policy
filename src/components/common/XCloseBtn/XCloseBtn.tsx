// 3rd party packages
import React, { FC } from "react";
import CSS from "csstype";
import classNames from "classnames";

// styles and assets
import styles from "./XCloseBtn.module.scss";
import crossSvg from "src/assets/icons/cross.svg";
import crossSvgWhite from "src/assets/icons/cross-white.svg";

interface XCloseBtnProps {
  onClick?(...args: any[]): void;
  title?: string;
  style?: CSS.Properties;
  show?: boolean;
  white?: boolean;
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
  white = false,
}) => {
  return (
    <button
      className={classNames(styles.xCloseBtn, { [styles.show]: show })}
      style={{
        backgroundImage: `url(${white ? crossSvgWhite : crossSvg})`,
        ...style,
      }}
      type="button"
      {...{ onClick, title }}
    ></button>
  );
};

export default XCloseBtn;
