import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyDescriptions,
  CATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyLoaders";

import ExpandingSection from "./ExpandingSection/ExpandingSection";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  const loadDescriptionsByCategory = categoryName => {
    const categoryNeedsDescriptions =
      // if category is empty request it immediately
      // (this will build the categories too)
      Object.entries(props.policyObject[categoryName])[1] === undefined
        ? true
        : // if the category exists, check if there is at least one
          // description already in the first subcategory
          Object.keys(
            Object.entries(
              Object.entries(props.policyObject[categoryName])[1]
            )[1][1]
          ).length === 0;

    if (categoryNeedsDescriptions) {
      const filters = {
        iso3: [iso3],
        [CATEGORY_FIELD_NAME]: [categoryName],
      };

      if (state !== "national") {
        filters["area1"] = [state];
      }

      loadPolicyDescriptions({ filters, stateSetter: props.setPolicyObject });
    }
  };

  return (
    <section>
      {props.policyObject &&
        Object.entries(props.policyObject).map(([categoryName, category]) => (
          <ExpandingSection
            key={categoryName}
            onOpen={() => loadDescriptionsByCategory(categoryName)}
          >
            <h1>
              {categoryName} {Object.keys(category).length}
            </h1>
            {Object.entries(category).map(([subcatName, subcat]) => (
              <ExpandingSection key={subcatName}>
                <h2>
                  {subcatName} {Object.keys(subcat).length}
                </h2>
                {Object.entries(subcat).map(([policyID, policy]) => (
                  <div key={policyID}>
                    {/* <ExpandingSection key={policyID}> */}
                    <h3>{policyID}</h3>
                    <p>{policyID} policy details</p>
                    {/* </ExpandingSection> */}
                  </div>
                ))}
              </ExpandingSection>
            ))}
          </ExpandingSection>
        ))}
    </section>
  );
};

export default ListPoliciesPage;
