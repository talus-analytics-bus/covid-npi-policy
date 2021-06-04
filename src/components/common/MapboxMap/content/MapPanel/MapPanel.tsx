import classes from "*.module.css";
import classNames from "classnames";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { Caret } from "../../../MapOptions/OptionDrawer/content/Caret/Caret";
import styles from "./PanelStyles.module.scss";
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

  const getWidth = () =>
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  function useCurrentWidth() {
    // save current window width in the state object
    let [width, setWidth] = useState(getWidth());

    // in this case useEffect will execute only once because
    // it does not have any dependencies.
    useEffect(() => {
      // timeoutId for debounce mechanism
      let timeoutId: NodeJS.Timeout | null = null;
      const resizeListener = () => {
        // prevent execution of previous setTimeout
        if (timeoutId) clearTimeout(timeoutId);
        // change width from the state object after 150 milliseconds
        timeoutId = setTimeout(() => setWidth(getWidth()), 150);
      };
      // set resize listener
      window.addEventListener("resize", resizeListener);

      // clean up function
      return () => {
        // remove resize listener
        window.removeEventListener("resize", resizeListener);
      };
    }, []);
    return width;
  }

  return (
    <div
      data-window-width={useCurrentWidth()}
      className={classNames(styles.mapPanel, styles.panelStyles, ...classes, {
        [styles.maxHeight]: maxHeight,
        [styles.drawerPanel]: drawerPanel,
        [styles.open]: open,
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
            ? `calc(100vh - ${getElHeight(tabRef)}px - 116px)`
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
