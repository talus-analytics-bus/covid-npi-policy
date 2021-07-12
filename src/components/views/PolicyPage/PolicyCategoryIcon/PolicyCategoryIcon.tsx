/**
 * Icon(s) representing different categories of policies in COVID AMP.
 */

// 3rd party modules
import React, { FunctionComponent, ReactElement } from "react";

// types (imported)
import CSS from "csstype";

// styles
import styles from "./PolicyCategoryIcon.module.scss";

// icon assets
import authorizationEnforcementIcon from "./icons/authorization-enforcement.png";
import contactTracingTestingIcon from "./icons/contact-tracing-testing.png";
import emergencyDeclarationsIcon from "./icons/emergency-declarations.png";
import faceMaskIcon from "./icons/face-mask.png";
import healthcareReadinessIcon from "./icons/healthcare-readiness.png";
import militaryMobilizationIcon from "./icons/military-mobilization.png";
import reliefMeasuresIcon from "./icons/relief-measures.png";
import socialDistancingIcon from "./icons/social-distancing.png";
import travelRestrictionsIcon from "./icons/travel-restrictions.png";
import vaccinationsIcon from "./icons/vaccine.png";

// CONSTANTS // ------------------------------------------------------------ //
/**
 * Map from name of category to icon asset to display.
 */
const iconDictionary: Record<string, string> = {
  "Support for public health and clinical capacity": healthcareReadinessIcon,
  "Face mask": faceMaskIcon,
  "Social distancing": socialDistancingIcon,
  "Contact tracing/Testing": contactTracingTestingIcon,
  "Emergency declarations": emergencyDeclarationsIcon,
  "Authorization and enforcement": authorizationEnforcementIcon,
  "Enabling and relief measures": reliefMeasuresIcon,
  "Travel restrictions": travelRestrictionsIcon,
  Vaccinations: vaccinationsIcon,
  "Military mobilization": militaryMobilizationIcon,
};

// default size of icon, must be square
const defaultSize: string = "2.5rem";

// default style of icon -- user-defined attributes override it
const defaultStyle: CSS.Properties = {
  height: defaultSize,
  width: defaultSize,
};

// CUSTOM TYPES // --------------------------------------------------------- //
/**
 * Properties for PolicyCategoryIcon function component.
 */
type PolicyCategoryIconProps = {
  /**
   * The category or categories of icon(s) to display. If multiple categories
   * are defined then icons are displayed in a grid.
   */
  category: string | string[];

  /**
   * True if nothing should be displayed if no category is defined, false if a
   * blank "icon container" (background) should be displayed.
   */
  blankIfNone?: boolean;

  /**
   * Custom styles to be applied to each icon. A default size of 2.5rem is
   * applied to height and width, which may be overriden in the property.
   */
  style?: CSS.Properties;
};

// FUNCTION COMPONENT // --------------------------------------------------- //
/**
 * Return circular icon(s) representing policy categories. If more than one
 * category is defined, the icons are displayed in a grid.
 */
const PolicyCategoryIcon: FunctionComponent<PolicyCategoryIconProps> = ({
  style = {},
  ...props
}): ReactElement | null => {
  if (props.category === undefined) return null;
  const categories: string[] =
    typeof props.category === "string" ? [props.category] : props.category;

  const srcs: Array<Array<string>> = categories
    .map((v: string) => {
      return [iconDictionary[v], v];
    })
    .filter(([v]) => {
      return v !== undefined;
    });
  const showIcons: boolean = srcs.length > 0 || props.blankIfNone !== true;
  const multipleIcons: boolean = srcs.length > 1;
  if (showIcons) {
    // define all icon(s) JSX, usually one, sometimes mult. (e.g., map popups)
    const icons: ReactElement[] = srcs.map(([src, cat]) => (
      <div
        key={cat}
        style={{ backgroundColor: "#96d6db", ...{ ...defaultStyle, ...style } }}
        className={styles.iconBackground}
      >
        <img src={src} alt={cat + " icon"} />
      </div>
    ));

    // if multi icons, show as grid, otherwise return the single icon
    if (multipleIcons)
      return (
        <div
          style={{
            gridTemplateColumns: `repeat(${srcs.length > 1 ? 2 : 1}, 1fr)`,
          }}
          className={styles.icons}
        >
          {icons}
        </div>
      );
    else return <>{icons}</>;
  } else return null;
};

export default PolicyCategoryIcon;
