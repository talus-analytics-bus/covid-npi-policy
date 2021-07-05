import React from "react";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import styles from "./ActiveJurisdiction.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveJurisdiction = props => {
  const {
    setStatus,
    setJurisdiction,
    policyFilters,
    setPolicyObject,
    setPolicyFilters,
  } = React.useContext(policyContext);

  console.log(policyFilters);

  const removeTarget = jurisdiction => {
    setPolicyFilters(prev => {
      const remainingJurisdictions = prev.level.filter(t => t !== jurisdiction);
      return {
        ...prev,
        level:
          remainingJurisdictions.length > 0
            ? remainingJurisdictions
            : undefined,
      };
    });

    setJurisdiction(prev => ({
      ...prev,
      selected: prev.selected.filter(t => t.value !== jurisdiction),
    }));

    setPolicyObject({});
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
  };

  console.log(policyFilters);

  if (policyFilters.level)
    return (
      <>
        {policyFilters.level.map((filter, index) => (
          <div key={filter} className={styles.activeTarget}>
            {/* {index === 0 ? ( */}
            {/*   <label> */}
            {/*     <strong> */}
            {/*       Policy{" "} */}
            {/*       {policyFilters.level.length === 1 */}
            {/*         ? "Jurisdiction" */}
            {/*         : "Jurisdictions"} */}
            {/*     </strong> */}
            {/*   </label> */}
            {/* ) : ( */}
            {/*   <label>&nbsp;</label> */}
            {/* )} */}
            <RemoveFilterButton
              light
              backgroundColor={"#C6DFDA"}
              onClick={() => removeTarget(filter)}
            >
              Jurisdiction: <strong>{filter}</strong>
            </RemoveFilterButton>
          </div>
        ))}
      </>
    );

  return <></>;
};

export default ActiveJurisdiction;
