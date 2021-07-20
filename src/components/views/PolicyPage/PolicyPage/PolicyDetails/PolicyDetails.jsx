import React from "react";

// import styles from "../PolicyPage.module.scss";
import styles from "../PolicyPage.module.scss";

const PolicyDetails = ({ policy }) => {
  const policyTargetList = policy && policy.subtarget;
  return (
    <section>
      <div className={styles.left}>
        <h2>POLICY DETAILS</h2>
        <h3>Relevant Authority</h3>
        <p>{policy && policy.authority_name}</p>
        <h3>Description</h3>
        <p>{policy && policy.desc}</p>
      </div>
      <div className={styles.right}>
        <h3>Policy Category</h3>
        <p>{policy && policy.primary_ph_measure}</p>
        <h3>Policy Subcategory</h3>
        <p>{policy && policy.ph_measure_details}</p>
        <h3>
          Policy{" "}
          {policyTargetList && policyTargetList.length > 1
            ? "Targets"
            : "Target"}
        </h3>
        {policyTargetList &&
          policyTargetList.map(target => <p key={target}>{target}</p>)}
      </div>
    </section>
  );
};

export default PolicyDetails;
