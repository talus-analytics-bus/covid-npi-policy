import React from "react";

// import DateSortControl from "./DateSortControl/DateSortControl";
import DateRangeControl from "./DateRangeControl/DateRangeControl";
import JurisdictionControl from "./JurisdictionControl/JurisdictionControl";
import SearchControl from "./SearchControl/SearchControl";
import TargetFilter from "./TargetFilter/TargetFilter";

import ActiveFilterBar from "./ActiveFilterBar/ActiveFilterBar";
import ActiveDateRange from "./ActiveDateRange/ActiveDateRange";
import ActiveTargets from "./ActiveTargets/ActiveTargets";
import ActiveJurisdiction from "./ActiveJurisdiction/ActiveJurisdiction";

import styles from "./PolicyFilters.module.scss";

const PolicyFilters = props => (
  <div className={styles.filterSection}>
    <div className={styles.filterBar}>
      {/* <DateSortControl /> */}
      <DateRangeControl />
      <JurisdictionControl />
      <TargetFilter />
      <SearchControl />
    </div>

    <ActiveFilterBar>
      <ActiveDateRange />
      <ActiveJurisdiction />
      <ActiveTargets />
    </ActiveFilterBar>
  </div>
);

export default PolicyFilters;
