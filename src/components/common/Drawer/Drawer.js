import React from "react";
import classNames from "classnames";
import { useState } from "react";
import styles from "./drawer.module.scss";

const Drawer = ({ label, content, ...props }) => {
  const [open, setOpen] = useState(props.defaultClosed !== true);
  return (
    <>
      <div
        style={{ display: open ? "block" : "none" }}
        className={styles.closer}
        onClick={e => {
          setOpen(false);
        }}
      ></div>
      <div
        className={classNames(styles.style, props.className, {
          [styles.float]: props.float === true,
          [styles.open]: open,
        })}
        style={props.style}
      >
        <div
          className={classNames(styles.header, {
            [styles.noCollapse]: props.noCollapse === true,
          })}
          onClick={e => {
            e.stopPropagation();
            props.noCollapse !== true && setOpen(!open);
          }}
        >
          {label}
          {props.noCollapse !== true && (
            <button
              style={props.customToggle && { display: "none" }}
              className={classNames(styles.toggle, { [styles.flip]: !open })}
            >
              <i className={"material-icons"}>expand_less</i>
            </button>
          )}
        </div>
        {
          <div
            className={classNames(styles.content, { [styles.hidden]: !open })}
          >
            {content}
          </div>
        }
      </div>
    </>
  );
};

export default Drawer;
