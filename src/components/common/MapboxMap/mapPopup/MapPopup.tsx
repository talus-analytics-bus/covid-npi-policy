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
  headerCustomContent?: ElementsOrNull;
  bodySections?: ElementsOrNull;
  bodyCustomContent?: ElementsOrNull;
  customClasses?: string[];
};
export type ActionLink = ReactElement<LinkProps> | null;

/**
 * Popup on map when a feature is clicked
 */
// FUNCTION COMPONENT // ----------------------------------------------------//
const MapPopup = ({
  headerTitle,
  headerSub,
  headerCustomContent = null,
  bodySections = null,
  bodyCustomContent = null,
  customClasses = [],
}: MapPopupProps) => {
  return (
    <div className={classNames(styles.mapPopup, ...customClasses)}>
      <PopupHeader
        {...{
          title: headerTitle,
          subtitle: headerSub,
          customContent: headerCustomContent,
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
