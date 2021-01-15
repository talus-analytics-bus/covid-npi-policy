import React from "react";

import DateSortControl from "./DateSortControl/DateSortControl";
import DateRangeControl from "./DateRangeControl/DateRangeControl";
import SearchControl from "./SearchControl/SearchControl";
import TargetFilter from "./TargetFilter/TargetFilter";

import ActiveDateRange from "./ActiveDateRange/ActiveDateRange";
import ActiveTargets from "./ActiveTargets/ActiveTargets";

import styles from "./PolicyFilters.module.scss";

const PolicyFilters = props => (
  <>
    <div className={styles.filterBar}>
      <DateSortControl />
      <DateRangeControl />
      <TargetFilter />
      <SearchControl />
    </div>

    <div className={styles.activeFilters}>
      <ActiveDateRange />
      <ActiveTargets />
    </div>
  </>
);

export default PolicyFilters;
