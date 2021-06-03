import classNames from "classnames";
import React, { FC, ReactElement, useState } from "react";
import { Caret } from "./content/Caret/Caret";
import styles from "./AccordionDrawer.module.scss";
type ComponentProps = {
  readonly title: string;
  readonly openDefault?: boolean;
  readonly children: ReactElement;
};
export const AccordionDrawer: FC<ComponentProps> = ({
  title,
  openDefault = true,
  children,
}) => {
  const [open, setOpen] = useState(openDefault);
  return (
    <>
      <div
        className={classNames(styles.title, { [styles.closed]: !open })}
        onClick={() => setOpen(!open)}
      >
        {title} <Caret up={!open} />
      </div>
      <div className={classNames(styles.body, { [styles.closed]: !open })}>
        {children}
      </div>
    </>
  );
};
export default AccordionDrawer;
