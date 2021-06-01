import React, { FC, ReactElement } from "react";
import styles from "../MapPanel.module.scss";

type ComponentProps = {
  children: ReactElement;
  style?: Record<string, string | number | undefined>;
};
export const PanelSet: FC<ComponentProps> = ({
  children,
  style,
}): ReactElement => {
  return (
    <div className={styles.panelSet} style={style}>
      {children}
    </div>
  );
};
