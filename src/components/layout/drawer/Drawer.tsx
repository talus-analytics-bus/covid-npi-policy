import React, { ReactElement } from "react";
import classNames from "classnames";
import { useState } from "react";
import CSS from "csstype";
import styles from "./drawer.module.scss";
import { FC } from "react";

interface DrawerProps {
  title?: string | ReactElement;
  label?: string | ReactElement | null;
  content?: ReactElement;
  style?: CSS.Properties;
  noCollapse?: boolean;
  headerColor?: CSS.ColorProperty;
  headerBackgroundColor?: CSS.BackgroundColorProperty;
}

const Drawer: FC<DrawerProps> = ({
  title,
  label,
  content,
  headerColor,
  headerBackgroundColor,
  style = {},
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

        {!noCollapse && (
          <button
            className={classNames(styles.toggle, { [styles.flip]: !open })}
          >
            <i className={"material-icons"}>expand_less</i>
          </button>
        )}
        {label}
      </div>
      {
        <div className={classNames(styles.content, { [styles.hidden]: !open })}>
          {content}
        </div>
      }
    </div>
  );
};

export default Drawer;
