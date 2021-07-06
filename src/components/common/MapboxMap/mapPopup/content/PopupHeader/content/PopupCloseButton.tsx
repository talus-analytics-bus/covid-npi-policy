// 3rd party packages
import React from "react";
import { FC } from "react";

// styles and assets
import styles from "./PopupCloseButton.module.scss";

interface PopupCloseButtonArgs {
  /**
   * Optional: Function called when close button is clicked to effect the
   * closing. Defaults to a function that does nothing.
   */
  onClose?(): void;
}

export const PopupCloseButton: FC<PopupCloseButtonArgs> = ({
  onClose = () => {},
}) => {
  return (
    <button
      className={styles.popupCloseButton}
      onClick={() => {
        if (onClose !== undefined) onClose();
      }}
    >
      <div className={styles.character}>×</div>
    </button>
  );
};
