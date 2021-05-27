import React from "react";

const PolicyDetails = ({ policy }) => {
  const policyTargetList = policy && policy.subtarget;
  return (
    <section>
      <h2>Policy Details</h2>
      <h3>Relevant Authority</h3>
      <p>
        <strong>{policy && policy.authority_name}</strong>
      </p>
      <h3>Description</h3>
      <p>
        <strong>{policy && policy.desc}</strong>
      </p>

      <h3>Policy Category</h3>
      <p>
        <strong>{policy && policy.primary_ph_measure}</strong>
      </p>
      <h3>Policy Subcategory</h3>
      <p>
        <strong>{policy && policy.ph_measure_details}</strong>
      </p>
      <h3>
        Policy{" "}
        {policyTargetList && policyTargetList.length > 1 ? "Targets" : "Target"}
      </h3>
      {policyTargetList &&
        policyTargetList.map(target => (
          <p key={target}>
            <strong>{target}</strong>
          </p>
        ))}
    </section>
  );
};

export default PolicyDetails;
