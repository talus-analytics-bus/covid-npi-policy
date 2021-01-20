import React from "react";
import { useLocation } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "../../../../misc/Queries";

import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";

import styles from "./OthersInDocument.module.scss";

const OthersInDocument = ({ policy, path }) => {
  const [policies, setPolicies] = React.useState();

  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

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

  return (
    <div className={styles.othersInDocument}>
      {policies &&
        policies.map(policy => (
          <MiniPolicyBox key={policy.id} {...{ policy, iso3, state, path }} />
        ))}
    </div>
  );
};

export default OthersInDocument;
