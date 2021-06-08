import React, { FunctionComponent, ReactElement } from "react";

import styles from "./PolicyCategoryIcon.module.scss";

import authorizationEnforcementIcon from "./icons/authorization-enforcement.png";
import contactTracingTestingIcon from "./icons/contact-tracing-testing.png";
import emergencyDeclarationsIcon from "./icons/emergency-declarations.png";
import faceMaskIcon from "./icons/face-mask.png";
import healthcareReadinessIcon from "./icons/healthcare-readiness.png";
import militaryMobilizationIcon from "./icons/military-mobilization.png";
import reliefMeasuresIcon from "./icons/relief-measures.png";
import socialDistancingIcon from "./icons/social-distancing.png";
import travelRestrictionsIcon from "./icons/travel-restrictions.png";
import vaccineIcon from "./icons/vaccine.png";

const iconDictionary: Record<string, string> = {
  "Support for public health and clinical capacity": healthcareReadinessIcon,
  "Face mask": faceMaskIcon,
  "Social distancing": socialDistancingIcon,
  "Contact tracing/Testing": contactTracingTestingIcon,
  "Emergency declarations": emergencyDeclarationsIcon,
  "Authorization and enforcement": authorizationEnforcementIcon,
  "Enabling and relief measures": reliefMeasuresIcon,
  "Travel restrictions": travelRestrictionsIcon,
  Vaccine: vaccineIcon,
  "Military mobilization": militaryMobilizationIcon,
};

type PolicyCategoryIconProps = {
  category: string | string[];
  margin?: string;
  blankIfNone?: boolean;
};

/**
 * Return circular icon representing the policy category.
 */
const PolicyCategoryIcon: FunctionComponent<PolicyCategoryIconProps> = (
  props
): ReactElement | null => {
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
  if (showIcons)
    return (
      <div
        style={{
          gridTemplateColumns: `repeat(${srcs.length > 1 ? 2 : 1}, 1fr)`,
        }}
        className={styles.icons}
      >
        {srcs.map(([src, cat]) => (
          <div
            style={{ backgroundColor: "#96d6db", margin: props.margin }}
            className={styles.iconBackground}
          >
            <img src={src} alt={cat + " icon"} />
          </div>
        ))}
      </div>
    );
  else return null;
};

export default PolicyCategoryIcon;
