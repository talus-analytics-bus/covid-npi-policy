import React, { FC, ReactElement } from "react";
import styles from "../MapPanel.module.scss";

type ComponentProps = {
  children: ReactElement;
  height?: string;
};
export const PanelSet: FC<ComponentProps> = ({
  children,
  height,
}): ReactElement => {
  return (
    <div className={styles.panelSet} style={{ height }}>
      {children}
    </div>
  );
};
