import React from "react";
import PolicySummary from "../../PolicySummary/PolicySummary";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

import styles from "./SearchResults.module.scss";

const SearchResults = props => {
  const {
    policyFilters,
    policySearchResults,
    policyListScrollPos,
  } = React.useContext(policyContext);

  const [, setScrollPos] = policyListScrollPos;

  // console.log(policySearchResults);

  const summaries =
    policySearchResults &&
    policySearchResults.data.map(policy => {
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
        (policyFilters.iso3[0] !== "USA" && place.level === "State / Province")
      ) {
        path = [
          ...path,
          "children",
          policy.auth_entity[0].place.loc.split(",")[0],
        ];
      }

      path = [...path, "children", `ID${policy.id}`];

      return (
        <PolicySummary
          key={path}
          path={path}
          policy={policy}
          setScrollPos={setScrollPos}
          wordLimit={50}
        />
      );
    });

  return <section>{summaries}</section>;
};

export default SearchResults;
