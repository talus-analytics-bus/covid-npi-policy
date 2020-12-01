import React from "react";
import { useParams } from "react-router-dom";

import { Policy } from "../../../misc/Queries";

import {
  extendObjectByPath,
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyRouter";

const ExpandSection = props => {
  const [renderChildren, setRenderChildren] = React.useState(false);

  let children = React.Children.toArray(props.children);

  const onClickHandler = e => {
    e.preventDefault();
    setRenderChildren(prev => !prev);
    props.onOpen();
  };

  return (
    <div>
      <button onClick={onClickHandler}>{children[0]}</button>
      {renderChildren &&
        (children.slice(1).length > 0 ? children.slice(1) : <p>Loading...</p>)}
    </div>
  );
};

const PolicyPage = props => {
  const { iso3, state } = useParams();

  console.log(props.policyObject);

  const loadPolicyDetails = (categoryName, subcatName) => {
    const loadPolicySubCategories = async ({ filters, stateSetter }) => {
      console.log("loadPolicySubCategories Called");
      const policyResponse = await Policy({
        method: "post",
        filters: filters,
        ordering: [["id", "desc"]],
        fields: ["id", CATEGORY_FIELD_NAME, SUBCATEGORY_FIELD_NAME],
      });

      stateSetter(() => {
        const categories = {};
        policyResponse.data.forEach(policy => {
          extendObjectByPath({
            obj: categories,
            path: [policy[CATEGORY_FIELD_NAME], policy[SUBCATEGORY_FIELD_NAME]],
            valueObj: {},
          });
        });
        return categories;
      });
    };
  };

  return (
    <section>
      {props.policyObject &&
        Object.entries(props.policyObject).map(([categoryName, category]) => (
          <ExpandSection key={categoryName}>
            <h1>
              {Object.keys(category).length} {categoryName}
            </h1>
            {Object.entries(category).map(([subcatName, subcat]) => (
              <ExpandSection
                key={subcatName}
                onOpen={() => loadPolicyDetails(categoryName, subcatName)}
              >
                <h2>
                  {Object.keys(subcat).length} {subcatName}
                </h2>
                {Object.entries(subcat).map(([policyID, policy]) => (
                  <ExpandSection key={policyID}>
                    <h3>{policyID}</h3>
                    <p>{policyID} policy details</p>
                  </ExpandSection>
                ))}
              </ExpandSection>
            ))}
          </ExpandSection>
        ))}
    </section>
  );
};

export default PolicyPage;
