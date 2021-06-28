import React from "react";
import styles from "../OptionControls.module.scss";

export const ControlLabel = ({ children }: { children: string }) => {
  return <div className={styles.controlLabel}>{children}</div>;
};
export default ControlLabel;
