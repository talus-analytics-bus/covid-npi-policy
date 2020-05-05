import React, { useState } from "react";
import { Filter } from "../";

// misc
import { isEmpty } from "../../misc/Util";

// assets and styles
import styles from "./filterset.module.scss";
import crossSvg from "../../../assets/icons/cross.svg";
import funnelSvg from "../../../assets/icons/funnel.svg";

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
          minMaxDate: v.minMaxDate,
          filters,
          setFilters,
          activeFilter,
          setActiveFilter
        }}
      />
    );
  }
  /**
   * Return a badge representing the filter value that can be clicked off
   * @method getBadge
   * @param  {[type]} label [description]
   * @param  {[type]} field [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  const getBadge = ({ label, field, value }) => {
    return (
      <div className={styles.badge}>
        <span>
          <span className={styles.label}>{label}:</span>
          <span className={styles.value}> {value}</span>
        </span>
        <div
          className={styles.close}
          onClick={() => {
            const newFilters = { ...filters };
            newFilters[field] = newFilters[field].filter(v => v !== value);
            if (newFilters[field].length > 0) {
              setFilters(newFilters);
            } else {
              delete newFilters[field];
              setFilters(newFilters);
            }
          }}
        >
          <a style={{ backgroundImage: `url(${crossSvg})` }} type="button"></a>
        </div>
      </div>
    );
  };

  // display selected filters as list of badges that can be clicked off
  const selectedFilters = (
    <div className={styles.selectedFilters}>
      <div className={styles.header}>
        <div className={styles.filterIcon}>
          <div style={{ backgroundImage: `url(${funnelSvg})` }} />
        </div>
        <span>Selected filters</span>
      </div>
      <div className={styles.badges}>
        {!isEmpty(filters) &&
          Object.entries(filters).map(([field, values]) =>
            values.map(value =>
              getBadge({ label: filterDefs[field].label, field, value })
            )
          )}
      </div>
    </div>
  );
  return (
    <React.Fragment>
      <div className={styles.filterSet}>{filterComponents}</div>
      {!isEmpty(filters) && selectedFilters}
    </React.Fragment>
  );
};

export default FilterSet;
