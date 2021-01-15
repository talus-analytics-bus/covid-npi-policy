import React from "react";
import { useLocation } from "react-router-dom";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import styles from "./ActiveFilterBar.module.scss";
import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveFilterBar = props => {
  const [state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-1);

  const {
    setStatus,
    setTargets,
    policyFilters,
    setPolicyFilters,
    policyObject,
    setPolicyObject,
    policySummaryObject,
  } = React.useContext(policyContext);

  const totalPolicyCount = Object.values(policySummaryObject).reduce(
    (acc, cur) => ({
      count: cur.count + acc.count,
      active: cur.active + acc.active,
    }),
    { count: 0, active: 0 }
  );

  const filteredPolicyCount = Object.values(policyObject).reduce(
    (acc, cur) => ({
      count: cur.count + acc.count,
      active: cur.active + acc.active,
    }),
    { count: 0, active: 0 }
  );

  const resetFilters = () => {
    setPolicyFilters(prev => ({
      ...prev,
      dates_in_effect: undefined,
      subtarget: undefined,
    }));
    setTargets(prev => ({ ...prev, selected: [] }));
    setPolicyObject(policySummaryObject);
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
  };

  if (policyFilters.subtarget || policyFilters.dates_in_effect)
    return (
      <div className={styles.activeFilterBar}>
        <p>
          <strong>Active Filters:</strong>
        </p>
        <div className={styles.activeFilters}>{props.children}</div>
        <div className={styles.summary}>
          {!isNaN(filteredPolicyCount.count) && (
            <p className={styles.filterSummary}>
              Displaying <strong>{filteredPolicyCount.count}</strong> out of{" "}
              <strong>{totalPolicyCount.count}</strong>{" "}
              {state !== "national" ? "state and county" : "national and local"}{" "}
              policies, of which <strong>{filteredPolicyCount.active}</strong>{" "}
              are active.
            </p>
          )}
          <RemoveFilterButton
            light
            backgroundColor={"#eeeeee"}
            className={styles.reset}
            onClick={resetFilters}
          >
            Reset All Filters
          </RemoveFilterButton>
        </div>
      </div>
    );
  else return <></>;
};

export default ActiveFilterBar;
