import React from "react";
import { Link } from "react-router-dom";

import { getObjectByPath } from "../../objectPathTools.js";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const TITLE_CHAR_LIMIT = 32;

const PolicyLink = ({ policy, children, style, className, ...props }) => {
  const { policyFilters, policyObject } = React.useContext(policyContext);

  const iso3 = policy.auth_entity[0].place.iso3;

  let state;
  if (iso3 === "USA") {
    const area1 = policy.auth_entity[0].place.area1;
    state = area1 === "Unspecified" ? "national" : area1;
  } else {
    state = "national";
  }

  const linkHref = `/policies/${iso3}/${state}/${policy.id}`;

  const truncateTitle = policy.policy_name.length > TITLE_CHAR_LIMIT;
  const title = truncateTitle
    ? policy.policy_name.slice(0, TITLE_CHAR_LIMIT) + "..."
    : policy.policy_name;

  let path = [
    policy[CATEGORY_FIELD_NAME],
    "children",
    policy.auth_entity[0].place.level,
    "children",
    policy[SUBCATEGORY_FIELD_NAME],
  ];

  const place = policy.auth_entity[0].place;

  if (
    (policyFilters.iso3[0] === "USA" && place.level === "Local") ||
    (policyFilters.iso3[0] !== "USA" && place.level === "State / Province") ||
    policyFilters.iso3[0] === "Unspecified"
  ) {
    path = [...path, "children", policy.auth_entity[0].place.loc];
  }

  path = [...path, "children", `ID${policy.id}`];

  const linkState = getObjectByPath({ obj: policyObject, path })
    ? { path: path }
    : undefined;

  return (
    <Link
      target={props.target}
      className={className}
      style={style}
      to={{
        pathname: linkHref,
        state: linkState,
      }}
    >
      {children}
    </Link>
  );
};

export default PolicyLink;
