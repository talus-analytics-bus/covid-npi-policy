import React from "react";

import styles from "./ActiveDateRange.module.scss";
import { dateRangeLabel } from "../DateRangeControl/DateRangeControl";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveDateRange = props => {
  const {
    // setStatus,
    policyFilters,
    // setPolicyObject,
    // setPolicyFilters,
  } = React.useContext(policyContext);

  if (policyFilters.dates_in_effect)
    return (
      <div className={styles.activeDateRange}>
        <label>Dates Policy in Effect</label>
        <RemoveFilterButton onClick={() => console.log(`remove dateRange`)}>
          Active During:{" "}
          {dateRangeLabel({
            startDate: policyFilters.dates_in_effect[0],
            endDate: policyFilters.dates_in_effect[1],
          })}
        </RemoveFilterButton>
      </div>
    );

  return <></>;
};

export default ActiveDateRange;
