import React from "react";
import styles from "./RemoveFilterButton.module.scss";

const RemoveFilterButton = props => (
  <button
    className={[
      styles.removeFilterButton,
      props.light ? styles.darkIcon : styles.lightIcon,
      props.className && props.className,
    ].join(" ")}
    style={{
      backgroundColor: props.backgroundColor || "#3274aa",
      color: props.light ? "#333" : "#fff",
      ...props.style,
    }}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

export default RemoveFilterButton;
