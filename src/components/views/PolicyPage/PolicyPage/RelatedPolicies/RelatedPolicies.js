import React from "react";
import { useLocation } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "../../../../misc/Queries";

import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";

import styles from "./RelatedPolicies.module.scss";

const RelatedPolicies = ({ policy, path }) => {
  const [policies, setPolicies] = React.useState();

  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  React.useEffect(() => {
    const getPoliciesInDocument = async () => {
      const policyResponse = await Policy({
        method: "post",
        pagesize: 3,
        filters: {
          [CATEGORY_FIELD_NAME]: [policy[CATEGORY_FIELD_NAME]],
          [SUBCATEGORY_FIELD_NAME]: [policy[SUBCATEGORY_FIELD_NAME]],
        },
        fields: [
          "id",
          CATEGORY_FIELD_NAME,
          SUBCATEGORY_FIELD_NAME,
          "date_issued",
          "policy_name",
          "auth_entity",
        ],
      });

      setPolicies(policyResponse.data);
    };

    if (policy && policy.policy_number) getPoliciesInDocument();
  }, [policy]);

  return (
    <div className={styles.relatedPolicies}>
      {policies &&
        policies.map(policy => (
          <MiniPolicyBox key={policy.id} {...{ policy, iso3, state, path }} />
        ))}
    </div>
  );
};

export default RelatedPolicies;
