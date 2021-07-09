import React, { ReactElement } from "react";
import classNames from "classnames";
import { useState } from "react";
import CSS from "csstype";
import styles from "./drawer.module.scss";
import { FC } from "react";
import { Caret } from "components/common";

interface DrawerProps {
  title?: string | ReactElement;
  label?: string | ReactElement | null;
  content?: ReactElement;
  style?: CSS.Properties;
  noCollapse?: boolean;
  headerColor?: CSS.ColorProperty;
  headerBackgroundColor?: CSS.BackgroundColorProperty;
  contentStyle?: CSS.Properties;
}

const Drawer: FC<DrawerProps> = ({
  title,
  label,
  content,
  headerColor,
  headerBackgroundColor,
  style = {},
  contentStyle = {},
  noCollapse = false,
}): ReactElement => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.style} style={style}>
      <div
        style={{ color: headerColor, backgroundColor: headerBackgroundColor }}
        className={classNames(styles.header, {
          [styles.noCollapse]: noCollapse,
        })}
        onClick={() => !noCollapse && setOpen(!open)}
      >
        {title}
        {!noCollapse && <Caret up={!open} style={{ fontSize: "1.25rem" }} />}
        {label}
      </div>
      {
        <div
          style={contentStyle}
          className={classNames(styles.content, { [styles.hidden]: !open })}
        >
          {content}
        </div>
      }
    </div>
  );
};

export default Drawer;
