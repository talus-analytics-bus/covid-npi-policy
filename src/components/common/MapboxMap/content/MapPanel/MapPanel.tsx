import classNames from "classnames";
import { getElHeight, getElWidth } from "src/components/misc/UtilsTyped";
import React, {
  FC,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Caret } from "src/components/common";
import PanelSetContext from "./PanelSet/PanelSet";
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
  /**
   * If this map panel is in a set, which number it is (zero-indexed)
   */
  panelSetId?: number;
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
  panelSetId = 0,
}): ReactElement => {
  let bodyRef = useRef<HTMLDivElement>(null);
  let tabRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [bottom, setBottom] = useState<number>(
    openDefault ? getElHeight(bodyRef) : 0
  );
  const [animating, setAnimating] = useState<boolean>(false);
  const curWidth: number = useCurrentWidth();
  const { panelWidths, setPanelWidths } = useContext(PanelSetContext);

  useEffect(() => {
    if (!open) updateBottom(setBottom, !open, bodyRef);
  }, [curWidth, setBottom, open]);

  useEffect(() => {
    if (animating) {
      setOpen(!open);
      updateBottom(setBottom, open, bodyRef);
      setTimeout(() => {
        setAnimating(false);
      }, 500);
    }
  }, [animating]); // eslint-disable-line

  useEffect(() => {
    const newPanelWidths: number[] = [...panelWidths];
    newPanelWidths[panelSetId] = open ? 1 : 0;
    setPanelWidths(newPanelWidths);
  }, [open]); // eslint-disable-line

  return (
    <div
      data-window-width={curWidth}
      className={classNames(styles.mapPanel, styles.panelStyles, ...classes, {
        [styles.maxHeight]: maxHeight,
        [styles.drawerPanel]: drawerPanel,
        [styles.open]: open,
        [styles.animating]: animating,
      })}
      style={{
        bottom,
        width: open ? undefined : getElWidth(tabRef),
      }}
    >
      <div
        className={classNames(styles.tab, {
          [styles.fit]: tabType === "fit",
        })}
        onClick={() => {
          setAnimating(true);
        }}
        ref={tabRef}
      >
        {tabName}
        <Caret up={!open} />
      </div>
      <div
        className={classNames(styles.body, { [styles.animating]: animating })}
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
function updateBottom(
  setBottom: React.Dispatch<React.SetStateAction<number>>,
  open: boolean,
  bodyRef: React.RefObject<HTMLDivElement>
) {
  setBottom(!open ? 0 : 0 - getElHeight(bodyRef));
}

const getWidth = () =>
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;

// TODO move this into a separate component for resizing-responsiveness
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
