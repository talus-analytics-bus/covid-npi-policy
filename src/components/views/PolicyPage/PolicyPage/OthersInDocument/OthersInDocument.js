import React from "react";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "api/Queries";

import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";

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

      setPolicies(otherPolicies.slice(0, 3));
    };

    if (policy && policy.policy_number) getPoliciesInDocument();
  }, [policy]);

  if (policies && policies.length > 0)
    return (
      <div className={styles.othersInDocument}>
        <h2>Other Policies in this Document</h2>
        <div className={styles.others}>
          {policies &&
            policies.map(policy => (
              <MiniPolicyBox key={policy.id} policy={policy} />
            ))}
        </div>
      </div>
    );
  else return false;
};

export default OthersInDocument;
