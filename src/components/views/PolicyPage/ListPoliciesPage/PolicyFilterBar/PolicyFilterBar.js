import React from "react";

import DateSortControl from "./DateSortControl/DateSortControl";
import DateRangeControl from "./DateRangeControl/DateRangeControl";

import styles from "./PolicyFilters.module.scss";

const PolicyFilters = props => (
  <div className={styles.filterBar}>
    <DateSortControl />
    <DateRangeControl />
  </div>
);

export default PolicyFilters;
