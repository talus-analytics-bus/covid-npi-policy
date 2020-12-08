import React from "react";
import classNames from "classnames";
import styles from "./resetzoom.module.scss";

/**
 * Reset button in bottom left corner of main map.
 * @method ResetZoom
 */
const ResetZoom = (props: any) => {
  return (
    <div className={classNames(styles.mapOverlay, styles.resetButton)}>
      <button onClick={props.handleClick}>
        <i className={"material-icons"}>open_in_full</i>
      </button>
    </div>
  );
};
export default ResetZoom;
