import React from "react";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "api/Queries";

import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";
import ExploreSource from "../ExploreSource/ExploreSource";

import styles from "./OthersInDocument.module.scss";

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

      setPolicies(otherPolicies.slice(0, 2));
    };

    if (policy && policy.policy_number) getPoliciesInDocument();
  }, [policy]);

  if (policies && policies.length > 0)
    return (
      <div className={styles.othersInDocument}>
        <h2 className={styles.lightGreyH2}>Other Policies in this Document</h2>
        <div className={styles.others}>
          {policies &&
            policies.map(policy => (
              <MiniPolicyBox key={policy.id} policy={policy} />
            ))}
          {policy && policy.policy_name !== "Not Available" && (
            <>
              <span className={styles.seeMoreText}>
                To see all other policies in this document, click the button
                below:
              </span>
              <ExploreSource {...{ policy }} />
            </>
          )}
        </div>
      </div>
    );
  else return <ExploreSource {...{ policy }} />;
};

export default OthersInDocument;
