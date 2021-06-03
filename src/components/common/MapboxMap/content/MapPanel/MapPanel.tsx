import classes from "*.module.css";
import classNames from "classnames";
import React, { FC, ReactElement, useRef, useState } from "react";
import { Caret } from "../../../MapOptions/OptionDrawer/content/Caret/Caret";
import styles from "./MapPanel.module.scss";
type TabType = "expand" | "fit";
type ComponentProps = {
  tabType?: TabType;
  tabName: string;
  children: ReactElement | ReactElement[];
  openDefault?: boolean;
  maxHeight?: boolean;
  bodyStyle?: Record<string, string>;
  classes?: string[];
  drawerPanel?: boolean;
};
export const MapPanel: FC<ComponentProps> = ({
  tabType = "fit",
  tabName,
  children,
  openDefault = true,
  maxHeight = false,
  bodyStyle = {},
  classes = [],
  drawerPanel = false,
}): ReactElement => {
  let bodyRef = useRef<HTMLDivElement>(null);
  let tabRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [bottom, setBottom] = useState<number>(
    openDefault ? getElHeight(bodyRef) : 0
  );

  return (
    <div
      className={classNames(styles.mapPanel, ...classes, {
        [styles.maxHeight]: maxHeight,
        [styles.drawerPanel]: drawerPanel,
      })}
      style={{
        bottom,
      }}
    >
      <div
        className={classNames(styles.tab, {
          [styles.fit]: tabType === "fit",
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
          ...bodyStyle,
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
