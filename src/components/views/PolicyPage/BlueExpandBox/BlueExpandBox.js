import React, { useState, useRef, Children } from "react";

import useEventListener from "../hooks/useEventListener";

import styles from "./BlueExpandBox.module.scss";

const ExpandBox = props => {
  const children = Children.toArray(props.children);
  const content = useRef();
  const button = useRef();

  const [hiderStyle, setHiderStyle] = useState({ height: 0 });
  const [iconStyle, setIconStyle] = useState({ transform: "scale(1, 1)" });

  const toggleHider = e => {
    e.preventDefault();
    if (hiderStyle.height === 0) {
      setHiderStyle({ height: content.current.offsetHeight });
      setIconStyle({ transform: "scale(1, -1)" });
    } else {
      setHiderStyle({ height: 0 });
      setIconStyle({ transform: "scale(1, 1)" });
    }
  };

  const expandHider = () => {
    // only call expand hider, don't toggle it
    console.log("expandHider called");
    if (hiderStyle.height === 0) {
      console.log("Expand the box");
      setHiderStyle({ height: content.current.offsetHeight });
      setIconStyle({ transform: "scale(1, -1)" });
    }
  };

  useEventListener("expand", expandHider, button.current);

  return (
    <section className={styles.main + " " + props.className}>
      <button
        aria-label={"Expand Section"}
        className={styles.firstSection}
        onClick={toggleHider}
        ref={button}
        // style={arrowStyle}
      >
        {/* <div */}
        {/*   className={styles.flag} */}
        {/*   style={{ backgroundColor: props.flagColor }} */}
        {/* ></div> */}
        {children[0]}
        <span className={styles.buttonIcon} style={iconStyle}></span>
      </button>
      <div className={styles.hiderStyle} style={hiderStyle}>
        <div ref={content}>{children.slice(1)}</div>
      </div>
    </section>
  );
};

export default ExpandBox;
