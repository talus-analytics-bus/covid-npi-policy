import React, { ReactElement } from "react";
import styles from "../OptionControls.module.scss";

export const ControlLabel = ({ children }: { children: any }) => {
  return <div className={styles.controlLabel}>{children}</div>;
};
export default ControlLabel;
