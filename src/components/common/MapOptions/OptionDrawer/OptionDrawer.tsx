import classNames from "classnames";
import React, { FC, ReactElement, useState } from "react";
import { Caret } from "src/components/common";
import styles from "./OptionDrawer.module.scss";
type ComponentProps = {
  readonly title: string;
  readonly openDefault?: boolean;
  readonly children: ReactElement;
};
export const OptionDrawer: FC<ComponentProps> = ({
  title,
  openDefault = true,
  children,
}) => {
  const [open, setOpen] = useState(openDefault);
  return (
    <div
      className={classNames(styles.optionDrawer, { [styles.closed]: !open })}
    >
      <div className={styles.title} onClick={() => setOpen(!open)}>
        {title} <Caret up={!open} />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};
export default OptionDrawer;
