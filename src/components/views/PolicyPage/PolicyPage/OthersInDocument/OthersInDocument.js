import React from "react";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "api/Queries";

// import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";
import ExploreSource from "../ExploreSource/ExploreSource";

import styles from "./OthersInDocument.module.scss";
import PolicyLink from "../PolicyLink/PolicyLink";
import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OthersInDocument = ({ policy, path }) => {
  const [policies, setPolicies] = React.useState();

  React.useEffect(() => {
    const getPoliciesInDocument = async () => {
      const policyResponse = await Policy({
        method: "post",
        pagesize: 100,
        filters: { policy_number: [policy.policy_number] },
        fields: [
          "id",
          CATEGORY_FIELD_NAME,
          SUBCATEGORY_FIELD_NAME,
          "date_issued",
          "policy_name",
          "auth_entity",
        ],
      });

      const otherPolicies = policyResponse.data.filter(
        otherPolicy => `${otherPolicy.id}` !== `${policy.id}`
      );

      setPolicies(otherPolicies);
    };

    if (policy && policy.policy_number) getPoliciesInDocument();
  }, [policy]);

  if (policies && policies.length > 0)
    return (
      <div>
        <h2>OTHER POLICIES IN THIS SOURCE DOCUMENT ({policies.length})</h2>
        <div className={styles.others}>
          {/* {policies &&
            policies.map(policy => (
              <MiniPolicyBox key={policy.id} policy={policy} />
            ))} */}
          {policies &&
            policies.slice(0, 3).map(policy => (
              <PolicyLink
                target="_blank"
                key={policy.id}
                policy={policy}
                className={styles.policyLink}
              >
                <PolicyCategoryIcon
                  category={policy[CATEGORY_FIELD_NAME]}
                  style={{
                    marginRight: ".5em",
                    height: "1.75em",
                    width: "1.75em",
                  }}
                />
                {`${policy.auth_entity[0].place.loc.split(",")[0]} 
                  ${policy[CATEGORY_FIELD_NAME]}: 
                  ${policy[SUBCATEGORY_FIELD_NAME]} issued 
                  ${formatDate(new Date(policy.date_issued))}`}
              </PolicyLink>
            ))}
          {policy && policy.policy_name !== "Not Available" && (
            <>
              {/* <span className={styles.seeMoreText}>
                To see all other policies in this document, click the button
                below:
              </span> */}
              {/* <ExploreSource {...{ policy }} className={styles.seeMore}> */}
              {/* See more */}
              {/* </ExploreSource> */}
              <ExploreSource {...{ policy }}>View all policies</ExploreSource>
            </>
          )}
        </div>
      </div>
    );
  else return false;
};

export default OthersInDocument;
