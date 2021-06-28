import React, { useState } from "react";
import { Filter } from "../";

// 3rd party packages
import classNames from "classnames";

// misc
import { isEmpty } from "../../misc/UtilsTyped";

// assets and styles
import styles from "./filterset.module.scss";
import { FilterSetSelections } from "./content/FilterSetSelections/FilterSetSelections";

/**
 * @method FilterSet
 * Create a bay of filters based on filter definitions
 */
const FilterSet = ({
  filterDefs,
  filters,
  setFilters,
  disabled = false,
  disabledValues = ["Country"],
  searchText = null,
  setSearchText,
  children = null,
  alignBottom = false,
  vertical = false,
  numInstances = null,
  instanceNouns = null,
  onClearAll,
  ...props
}) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const filterGroups = [];
  const filterDefsObj = {};
  const badgesToShow =
    !isEmpty(filters) || (searchText !== null && searchText !== "");
  filterDefs.forEach(filterGroup => {
    const filterGroupComponents = [];

    for (const [k, v] of Object.entries(filterGroup)) {
      filterDefsObj[k] = v;
      let items = v.items;
      // if filter has a primary filter that drives its items, parse them
      if (v.items !== undefined && v.primary !== undefined) {
        const primaryFilters = filters[v.primary] || [];
        // if primary filters are undefined or zero length, disable this filter
        // otherwise set its items based on the selections
        items = v.items.filter(d => {
          return primaryFilters.includes(d.group);
        });
      }
      filterGroupComponents.push(
        <Filter
          {...{
            key: v.field,
            field: v.field,
            label: v.label,
            items: items,
            radio: v.radio,
            className: v.className,
            defaultRadioValue: v.defaultRadioValue,
            dateRange: v.dateRange,
            minMaxDate: v.minMaxDate,
            primary: v.primary,
            disabledText: v.disabledText,
            filters,
            setFilters,
            activeFilter,
            setActiveFilter,
            withGrouping: v.withGrouping,
            params: v.params,
            alignBottom,
            ...props,
          }}
        />
      );
    }
    filterGroupComponents.dropdowns = !filterGroupComponents.some(
      d => d.props.radio
    );
    filterGroups.push(filterGroupComponents);
  });

  // display selected filters as list of badges that can be clicked off
  const filterKeys = Object.keys(filters);
  const noNonTextFilters = filterKeys.length === 1 && filterKeys[0] === "_text";
  const selectedFilters =
    props.showSelectedFilters === false ? null : (
      <FilterSetSelections
        {...{
          filters,
          searchText,
          filterDefsObj,
          noNonTextFilters,
          numInstances,
          instanceNouns,
          setFilters,
          setSearchText,
          onClearAll,
        }}
      />
    );

  return (
    <React.Fragment>
      <div
        className={classNames(styles.filterSet, {
          [styles.disabled]: disabled,
          [styles.vertical]: vertical,
        })}
      >
        {filterGroups.map(d => (
          <div
            key={d.map(dd => dd.key).join("-")}
            className={classNames(styles.filterGroup, {
              [styles.dropdowns]: d.dropdowns,
            })}
          >
            {d}
          </div>
        ))}
      </div>
      {children}
      {badgesToShow && selectedFilters}
    </React.Fragment>
  );
};

export default FilterSet;
