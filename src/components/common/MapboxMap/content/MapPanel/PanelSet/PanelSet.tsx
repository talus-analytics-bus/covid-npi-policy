import classNames from "classnames";
import React, { Children, FC, ReactElement, useState } from "react";
import styles from "../PanelStyles.module.scss";

type ComponentProps = {
  children: ReactElement;
  style?: Record<string, string | number | undefined>;
};
export const PanelSet: FC<ComponentProps> = ({
  children,
  style,
}): ReactElement => {
  // get width of open panels
  // set closed tab position to be next to next open panel or tab
  const nChildren: number = Children.count(children);
  const [panelWidths, setPanelWidths] = useState<number[]>(
    new Array(nChildren).fill(1)
  );

  const childrenWithProps = React.Children.map(children, (child, i: number) => {
    // checking isValidElement is the safe way and avoids a typescript error too
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { panelSetId: i });
    }
    return child;
  });

  const defaultGridTemplateColumns: string[] =
    style !== undefined && style.gridTemplateColumns !== undefined
      ? (style.gridTemplateColumns as string).split(" ")
      : Array(nChildren).fill("auto");

  return (
    <PanelSetProvider value={{ panelWidths, setPanelWidths }}>
      <div
        className={classNames(styles.panelSet, styles.panelStyles)}
        style={{
          gridTemplateColumns: panelWidths
            .map((d: number, i: number) => {
              if (d === 1) return defaultGridTemplateColumns[i];
              else return "min-content";
            })
            .join(" "),
        }}
      >
        {childrenWithProps}
      </div>
    </PanelSetProvider>
  );
};

const PanelSetContext = React.createContext<{
  panelWidths: number[];
  setPanelWidths(newWidths: number[]): void;
}>({
  panelWidths: [],
  setPanelWidths: (newWidths: number[]) => [],
});
export const PanelSetProvider = PanelSetContext.Provider;
export default PanelSetContext;
