import React from "react";

import styles from "./ActiveDateRange.module.scss";
import { dateRangeLabel } from "../DateRangeControl/DateRangeControl";

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
      <button>
        Active During:{" "}
        {dateRangeLabel({
          startDate: policyFilters.dates_in_effect[0],
          endDate: policyFilters.dates_in_effect[1],
        })}
      </button>
    );

  return <></>;
};

export default ActiveDateRange;
