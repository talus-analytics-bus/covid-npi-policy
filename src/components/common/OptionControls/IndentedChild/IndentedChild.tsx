import React, { FC, ReactElement } from "react";
import styles from "./IndentedChild.module.scss";

interface IndentedChildProps {
  /**
   * The child to be displayed in an indented section beneath the
   * parent content.
   */
  children: ReactElement;
}
export const IndentedChild: FC<IndentedChildProps> = ({ children }) => {
  return <div className={styles.indentedChild}>{children}</div>;
};
