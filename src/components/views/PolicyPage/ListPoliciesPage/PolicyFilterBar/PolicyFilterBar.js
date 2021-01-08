import React from "react";

import DateSortControl from "./DateSortControl/DateSortControl";
import DateRangeControl from "./DateRangeControl/DateRangeControl";
import SearchControl from "./SearchControl/SearchControl";

import styles from "./PolicyFilters.module.scss";

const PolicyFilters = props => (
  <div className={styles.filterBar}>
    <DateSortControl />
    <DateRangeControl />
    <SearchControl />
  </div>
);

export default PolicyFilters;
