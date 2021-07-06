import React, { FunctionComponent } from "react";
import styles from "./labeledicon.module.scss";

type LabelIconProps = {
  icon: JSX.Element | null;
  label: string | JSX.Element;
  maxLabelWidth?: number;
};
export const LabeledIcon: FunctionComponent<LabelIconProps> = ({
  icon,
  label,
  maxLabelWidth,
}): JSX.Element => {
  return (
    <div className={styles.labeledIcon}>
      {icon && <div className={styles.iconContainer}>{icon}</div>}
      <div
        style={{ maxWidth: maxLabelWidth }}
        className={styles.labelContainer}
      >
        {label}
      </div>
    </div>
  );
};
