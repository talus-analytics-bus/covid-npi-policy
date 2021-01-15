import React from "react";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import styles from "./ActiveTargets.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveDateRange = props => {
  const {
    setStatus,
    setTargets,
    policyFilters,
    setPolicyObject,
    setPolicyFilters,
  } = React.useContext(policyContext);

  const removeTarget = target => {
    setPolicyFilters(prev => {
      const remainingTargets = prev.subtarget.filter(t => t !== target);
      return {
        ...prev,
        subtarget: remainingTargets.length > 0 ? remainingTargets : undefined,
      };
    });

    setTargets(prev => ({
      ...prev,
      selected: prev.selected.filter(t => t.value !== target),
    }));

    setPolicyObject({});
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
  };

  if (policyFilters.subtarget)
    return (
      <>
        {policyFilters.subtarget.map((filter, index) => (
          <div key={filter} className={styles.activeTarget}>
            {index === 0 ? (
              <label>
                Policy{" "}
                {policyFilters.subtarget.length === 1 ? "Target" : "Targets"}
              </label>
            ) : (
              <label>&nbsp;</label>
            )}
            <RemoveFilterButton
              backgroundColor={"#4E8490"}
              onClick={() => removeTarget(filter)}
            >
              {filter}
            </RemoveFilterButton>
          </div>
        ))}
      </>
    );

  return <></>;
};

export default ActiveDateRange;
