import React, { useState } from "react";
import styles from "./filterset.module.scss";
import { Filter } from "../";

/**
 * @method FilterSet
 * Create a bay of filters based on filter definitions
 */
const FilterSet = ({ filterDefs, filters, setFilters, ...props }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const filterComponents = [];
  for (const [k, v] of Object.entries(filterDefs)) {
    const items = [];
    filterComponents.push(
      <Filter
        {...{
          field: v.field,
          label: v.label,
          items: v.items,
          dateRange: v.dateRange,
          filters,
          setFilters,
          activeFilter,
          setActiveFilter
        }}
      />
    );
  }
  return <div className={styles.filterSet}>{filterComponents}</div>;
};

export default FilterSet;
