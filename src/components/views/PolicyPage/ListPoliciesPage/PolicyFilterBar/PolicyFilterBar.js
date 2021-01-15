import React from "react";

import DateSortControl from "./DateSortControl/DateSortControl";
import DateRangeControl from "./DateRangeControl/DateRangeControl";
import SearchControl from "./SearchControl/SearchControl";
import TargetFilter from "./TargetFilter/TargetFilter";

import styles from "./PolicyFilters.module.scss";

const PolicyFilters = props => (
  <div className={styles.filterBar}>
    <DateSortControl />
    <DateRangeControl />
    <TargetFilter />
    <SearchControl />
  </div>
);

export default PolicyFilters;
