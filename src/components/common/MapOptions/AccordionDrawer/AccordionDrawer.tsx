import classNames from "classnames";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { Caret } from "../../Caret/Caret";
import styles from "./AccordionDrawer.module.scss";
import { getElHeight } from "components/misc/UtilsTyped";
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
  const [open, setOpen] = useState<boolean>(openDefault);
  const [bodyHeight, setBodyHeight] = useState<string>("100%");
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opening = open;
    // if opening, unset height, then trigger closing
    if (opening) {
      setBodyHeight("100%");
    }
    // if closing, set height to current calculated height, then trigger open
    else {
      setBodyHeight(getElHeight(bodyRef) + "px");
    }
  }, [open]);

  return (
    <>
      <div
        className={classNames(styles.title, { [styles.closed]: !open })}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {title} <Caret up={!open} />
      </div>
      <div
        ref={bodyRef}
        style={{ height: bodyHeight }}
        className={classNames(styles.body, { [styles.closed]: !open })}
      >
        <div className={styles.bodyChildContainer}>{children}</div>
      </div>
    </>
  );
};
export default AccordionDrawer;
