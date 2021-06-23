import React, { FunctionComponent } from "react";
import styles from "./popupheader.module.scss";

// types
import { ElementsOrNull } from "../../../plugins/mapTypes";
import classNames from "classnames";

// component types
type PopupHeaderProps = {
  /**
   * Title of header that appears in upper-left corner.
   */
  title: string | ElementsOrNull;

  /**
   * Optional: Subtitle of header that appears beneath the header text.
   */
  subtitle?: string | ElementsOrNull;

  /**
   * Optional: Content appearing in the right side of the header.
   */
  rightContent?: ElementsOrNull;

  /**
   * Optional: Custom content overriding template structure of header.
   */
  customContent?: ElementsOrNull;

  /**
   * Optional: True if close button should be shown in upper-right corner,
   * false otherwise. Defaults to false.
   */
  showClose?: boolean;

  /**
   * Optional: Function called when close button is clicked. Required if
   * `showClose` is true.
   */
  onClose?(): void;
};

/**
 * Header component for a map popup.
 */
export const PopupHeader: FunctionComponent<PopupHeaderProps> = ({
  title,
  subtitle = null,
  rightContent = null,
  customContent = null,
  showClose = false,
  onClose,
}): JSX.Element => {
  // display templatized header if no custom content, otherwise display custom
  if (customContent === null)
    return (
      <Container>
        <div className={styles.left}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
        {/* Display right content, if defined */}
        <div
          className={classNames(styles.right, {
            [styles.withClose]: showClose,
          })}
        >
          {rightContent}
          {showClose && (
            <button
              className={styles.close}
              onClick={() => {
                if (onClose !== undefined) onClose();
              }}
            >
              ×
            </button>
          )}
        </div>
      </Container>
    );
  else return <Container>{customContent}</Container>;
};

// define container element for popup header content
const Container: FunctionComponent<{
  children: ElementsOrNull;
}> = ({ children }) => {
  return <div className={styles.popupHeader}>{children}</div>;
};

export default PopupHeader;
