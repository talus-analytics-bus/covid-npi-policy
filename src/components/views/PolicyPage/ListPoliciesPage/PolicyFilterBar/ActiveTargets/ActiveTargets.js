import React from "react";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

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
        {policyFilters.subtarget.map((f, index) => (
          <div className={styles.activeTarget}>
            {index === 0 ? (
              <label>
                Policy{" "}
                {policyFilters.subtarget.length === 1 ? "Target" : "Targets"}
              </label>
            ) : (
              <label>&nbsp;</label>
            )}
            <RemoveFilterButton
              key={f}
              backgroundColor={"#4E8490"}
              onClick={() => console.log(`remove ${f}`)}
            >
              {f}
            </RemoveFilterButton>
          </div>
        ))}
      </>
    );

  return <></>;
};

export default ActiveDateRange;
