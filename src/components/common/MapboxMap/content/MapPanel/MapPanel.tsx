import classNames from "classnames";
import React, { FC, ReactElement, useRef, useState } from "react";
import { Caret } from "./helpers";
import styles from "./MapPanel.module.scss";
type TabStyle = "expand" | "fit";
type ComponentProps = {
  tabStyle?: TabStyle;
  tabName: string;
  children: ReactElement;
  openDefault?: boolean;
  maxHeight?: boolean;
};
export const MapPanel: FC<ComponentProps> = ({
  tabStyle = "fit",
  tabName,
  children,
  openDefault = true,
  maxHeight = false,
}): ReactElement => {
  let bodyRef = useRef<HTMLDivElement>(null);
  let tabRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [bottom, setBottom] = useState<number>(
    openDefault ? getElHeight(bodyRef) : 0
  );

  return (
    <div
      className={classNames(styles.mapPanel, { [styles.maxHeight]: maxHeight })}
      style={{
        bottom,
      }}
    >
      <div
        className={classNames(styles.tab, {
          [styles.fit]: tabStyle === "fit",
        })}
        onClick={() => {
          setOpen(!open);
          setBottom(!open ? 0 : 1 - getElHeight(bodyRef));
        }}
        ref={tabRef}
      >
        {tabName} <Caret up={!open} />
      </div>
      <div
        className={styles.body}
        style={{
          height: maxHeight
            ? `calc(100% - ${getElHeight(tabRef)}px)`
            : undefined,
        }}
        ref={bodyRef}
      >
        {children}
      </div>
    </div>
  );
};
function getElHeight(ref: React.RefObject<HTMLDivElement>): number {
  if (ref !== null && ref.current !== null) {
    return ref.current.getBoundingClientRect().height;
  } else return 0;
}
