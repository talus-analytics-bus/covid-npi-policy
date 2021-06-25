import React from "react";
import styles from "../OptionControls.module.scss";

export const ControlLabel = ({ children }: { children: string }) => {
  return <span className={styles.controlLabel}>{children}</span>;
};
export default ControlLabel;
