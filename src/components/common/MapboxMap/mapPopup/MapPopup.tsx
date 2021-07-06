/**
 * Tooltip for MapboxMap component.
 */
// standard packages
import React, { ReactElement } from "react"; // 3rd party packages

import styles from "./mappopup.module.scss";
import PopupHeader from "./content/PopupHeader/PopupHeader";
import PopupBody from "./content/PopupBody/PopupBody";
import { ElementsOrNull } from "../plugins/mapTypes";
import { LinkProps } from "react-router-dom";
import classNames from "classnames";

type MapPopupProps = {
  headerTitle: string | JSX.Element;
  headerSub?: string | JSX.Element;
  headerRightContent?: ElementsOrNull;
  headerCustomContent?: ElementsOrNull;
  bodySections?: ElementsOrNull;
  bodyCustomContent?: ElementsOrNull;
  customClasses?: string[];

  /**
   * Optional: True if close button should be shown in upper-right corner,
   * false otherwise. Defaults to true.
   */
  showClose?: boolean;

  /**
   * Optional: Function called when close button is clicked. Required if
   * `showClose` is true.
   */
  onClose?(...args: any[]): void;
};
export type ActionLink = ReactElement<LinkProps> | null;

/**
 * Popup on map when a feature is clicked
 */
// FUNCTION COMPONENT // ----------------------------------------------------//
const MapPopup = ({
  headerTitle,
  headerSub,
  headerRightContent = null,
  headerCustomContent = null,
  bodySections = null,
  bodyCustomContent = null,
  customClasses = [],
  showClose = false,
  onClose,
}: MapPopupProps) => {
  // validate inputs
  if (showClose && onClose === undefined) {
    throw Error("Must define `onClose` if `showClose` is true.");
  }

  // JSX // ---------------------------------------------------------------- //
  return (
    <div className={classNames(styles.mapPopup, ...customClasses)}>
      <PopupHeader
        {...{
          title: headerTitle,
          subtitle: headerSub,
          rightContent: headerRightContent,
          customContent: headerCustomContent,
          showClose,
          onClose,
        }}
      />
      <PopupBody
        {...{
          sections: bodySections,
          customContent: bodyCustomContent,
        }}
      />
    </div>
  );
};

export default MapPopup;
