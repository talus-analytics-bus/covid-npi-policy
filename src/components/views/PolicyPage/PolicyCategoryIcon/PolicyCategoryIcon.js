import React from "react";

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
import vacineIcon from "./icons/vaccine.png";

const iconDictionary = {
  "Support for public health and clinical capacity": healthcareReadinessIcon,
  "Face mask": faceMaskIcon,
  "Social distancing": socialDistancingIcon,
  "Contact tracing/Testing": contactTracingTestingIcon,
  "Emergency declarations": emergencyDeclarationsIcon,
  "Authorization and enforcement": authorizationEnforcementIcon,
  "Enabling and relief measures": reliefMeasuresIcon,
  "Travel restrictions": travelRestrictionsIcon,
  Vaccine: vacineIcon,
  "Military mobilization": militaryMobilizationIcon,
};

const PolicyCategoryIcon = props => (
  <div
    className={styles.iconBackground}
    style={{ backgroundColor: "#96d6db", ...props.style }}
  >
    {iconDictionary[props.category] && (
      <img src={iconDictionary[props.category]} alt={props.category + "icon"} />
    )}
  </div>
);

export default PolicyCategoryIcon;
