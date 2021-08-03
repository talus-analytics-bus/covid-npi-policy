import React from "react";

import styles from "./ActiveDateRange.module.scss";
import { dateRangeLabel } from "../DateRangeControl/DateRangeControl";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveDateRange = props => {
  const {
    setStatus,
    policyFilters,
    setPolicyObject,
    setPolicyFilters,
    setDateRangeControlValue,
  } = React.useContext(policyContext);

  const resetDateRange = () => {
    setDateRangeControlValue({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setPolicyFilters(prev => ({
      ...prev,
      dates_in_effect: undefined,
    }));
    setPolicyObject({});
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
  };

  if (policyFilters.dates_in_effect)
    return (
      <div className={styles.activeDateRange}>
        {/* <label> */}
        {/* <strong>Dates Policy in Effect</strong> */}
        {/* </label> */}
        <RemoveFilterButton
          light
          backgroundColor={"#C6DFDA"}
          onClick={resetDateRange}
        >
          Active During:{" "}
          <strong>
            {dateRangeLabel({
              startDate: policyFilters.dates_in_effect[0],
              endDate: policyFilters.dates_in_effect[1],
            })}
          </strong>
        </RemoveFilterButton>
      </div>
    );

  return <></>;
};

export default ActiveDateRange;
