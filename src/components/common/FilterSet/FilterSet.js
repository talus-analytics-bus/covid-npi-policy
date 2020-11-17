import React, { useState } from "react";
import { Filter } from "../";

// 3rd party packages
import classNames from "classnames";

// local functions
import { getInputLabel } from "../Filter/Filter.js";

// local components
import { ShowMore } from "../";

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
const FilterSet = ({
  filterDefs,
  filters,
  setFilters,
  disabled = false,
  disabledValues = ["Country"],
  searchText = null,
  setSearchText,
  children = null,
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
      <div className={styles.badge} key={field + "-" + value}>
        <span>
          <span className={styles.label}>{label}:</span>
          <span className={styles.value}>
            {" "}
            {<ShowMore text={value} charLimit={60} />}
          </span>
        </span>
        <div
          className={styles.close}
          onClick={() => {
            if (field !== "Text") {
              const newFilters = { ...filters };
              newFilters[field] = newFilters[field].filter(v => v !== value);

              if (
                filterDefsObj[field].dateRange ||
                newFilters[field].length === 0
              ) {
                delete newFilters[field];
                setFilters(newFilters);
              } else {
                setFilters(newFilters);
              }
            } else {
              setSearchText(null);
            }
          }}
        >
          <a style={{ backgroundImage: `url(${crossSvg})` }} type="button"></a>
        </div>
      </div>
    );
  };

  // display selected filters as list of badges that can be clicked off
  const selectedFilters =
    props.showSelectedFilters === false ? null : (
      <div className={styles.selectedFilters}>
        <div className={styles.header}>
          <div className={styles.filterIcon}>
            <div style={{ backgroundImage: `url(${funnelSvg})` }} />
          </div>
          <span>Selected filters</span>
        </div>

        <div className={styles.badges}>
          {!isEmpty(filters) &&
            Object.entries(filters).map(([field, values]) => (
              <React.Fragment key={field + "-" + values.join("-")}>
                {!filterDefsObj[field].dateRange &&
                  values.map(value =>
                    getBadge({
                      label:
                        filterDefsObj[field].labelShort ||
                        filterDefsObj[field].label,
                      field,
                      value,
                    })
                  )}
                {filterDefsObj[field].dateRange &&
                  getBadge({
                    label:
                      filterDefsObj[field].labelShort ||
                      filterDefsObj[field].label,
                    field,
                    value: getInputLabel({
                      dateRange: true,
                      dateRangeState: [
                        { startDate: values[0], endDate: values[1] },
                      ],
                    }),
                  })}
              </React.Fragment>
            ))}
          {searchText !== null &&
            searchText !== "" &&
            getBadge({
              label: "Text",
              field: "Text",
              value: searchText,
            })}
        </div>
      </div>
    );

  return (
    <React.Fragment>
      <div
        className={classNames(styles.filterSet, {
          [styles.disabled]: disabled,
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
