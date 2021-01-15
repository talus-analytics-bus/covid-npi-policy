import React from "react";

import styles from "./ActiveTargets.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveDateRange = props => {
  const {
    // setStatus,
    policyFilters,
    // setPolicyObject,
    // setPolicyFilters,
  } = React.useContext(policyContext);

  if (policyFilters.subtarget)
    return (
      <>
        {policyFilters.subtarget.map(f => (
          <button key={f}>{f}</button>
        ))}
      </>
    );

  return <></>;
};

export default ActiveDateRange;
