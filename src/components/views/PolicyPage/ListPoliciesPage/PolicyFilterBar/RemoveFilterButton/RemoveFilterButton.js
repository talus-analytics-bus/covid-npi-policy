import React from "react";
import styles from "./RemoveFilterButton.module.scss";

const RemoveFilterButton = props => (
  <button
    className={styles.removeFilterButton}
    style={{ backgroundColor: props.backgroundColor || "#3274aa" }}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

export default RemoveFilterButton;
