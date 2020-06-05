import React from "react";
import classNames from "classnames";
import { useState } from "react";
import styles from "./drawer.module.scss";

const Drawer = ({ label, content, ...props }) => {
  const [open, setOpen] = useState(true);
  return (
    <div
      className={classNames(styles.style, props.className, {
        [styles.float]: props.float === true
      })}
      style={props.style}
    >
      <div
        className={classNames(styles.header, {
          [styles.noCollapse]: props.noCollapse === true
        })}
        onClick={() => props.noCollapse !== true && setOpen(!open)}
      >
        {label}
        {props.noCollapse !== true && (
          <button
            className={classNames(styles.toggle, { [styles.flip]: !open })}
          >
            <i className={"material-icons"}>expand_less</i>
          </button>
        )}
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
