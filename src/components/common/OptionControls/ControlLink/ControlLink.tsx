import React from "react";
import CSS from "csstype";
import styles from "./ControlLink.module.scss";

interface ControlLinkProps {
  children: any;
  style: CSS.Properties;
  onClick?(...args: any[]): void;
}
export const ControlLink = ({
  children,
  style = {},
  onClick = () => {},
}: ControlLinkProps) => {
  return (
    <span style={style} onClick={onClick} className={styles.controlLink}>
      {children}
    </span>
  );
};
export default ControlLink;
