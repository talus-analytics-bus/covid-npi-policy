import React, { FunctionComponent } from "react";
import styles from "./popupheader.module.scss";

// types
import { ElementsOrNull } from "../../../plugins/mapTypes";

// component types
type PopupHeaderProps = {
  title: string | ElementsOrNull;
  subtitle?: string | ElementsOrNull;
  rightContent?: ElementsOrNull;
  customContent?: ElementsOrNull;
};

/**
 * Header component for a map popup.
 *
 * @param {string} props.title
 * Title of popup.
 *
 * @param {string?} props.subtitle
 * Optional: Subtitle of popup.
 *
 * @param {JSX.Element | null} props.rightContent
 * Optional: Content displayed on right side of header.
 * @param {JSX.Element | null} props.customContent
 * Optional: Content displayed instead of templated header content.
 */
export const PopupHeader: FunctionComponent<PopupHeaderProps> = ({
  title,
  subtitle = null,
  rightContent = null,
  customContent = null,
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
        {rightContent && <div className={styles.right}>{rightContent}</div>}
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
