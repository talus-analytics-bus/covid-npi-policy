import React from "react";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import { Policy } from "../../../../misc/Queries";

import MiniPolicyBox from "../MiniPolicyBox/MiniPolicyBox";

const OthersInDocument = ({ policy }) => {
  const policies = ["hi", "teo", "three"];

  //   React.useEffect(() => {
  //     const getPoliciesInDocument = async () => {
  //       const policyResponse = await Policy({
  //         method: "post",
  //         filters: { policy_number: [policy.policy_number] },
  //         fields: [
  //           "id",
  //           CATEGORY_FIELD_NAME,
  //           SUBCATEGORY_FIELD_NAME,
  //           "date_issued",
  //           "policy_name",
  //         ],
  //       });
  //     };
  //
  //     if (policy && policy.policy_number) getPoliciesInDocument();
  //   }, [policy]);

  return (
    <>
      {policies.map(policy => (
        <MiniPolicyBox key={policy} policy={policy} />
      ))}
    </>
  );
};

export default OthersInDocument;
