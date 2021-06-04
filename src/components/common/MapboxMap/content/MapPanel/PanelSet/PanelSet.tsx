import classNames from "classnames";
import React, { FC, ReactElement } from "react";
import styles from "../PanelStyles.module.scss";

type ComponentProps = {
  children: ReactElement;
  style?: Record<string, string | number | undefined>;
};
export const PanelSet: FC<ComponentProps> = ({
  children,
  style,
}): ReactElement => {
  return (
    <div
      className={classNames(styles.panelSet, styles.panelStyles)}
      style={style}
    >
      {children}
    </div>
  );
};
