// standard packages
import React, { useState, useEffect } from "react";

// 3rd party modules
import MultiSelect from "@kenshooui/react-multi-select";
import { DateRange } from "react-date-range";
import moment from "moment";

// assets and styles
import styles from "./filter.module.scss";
import classNames from "classnames";
import "@kenshooui/react-multi-select/dist/style.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/**
 * @method Filter
 * create a clickable filter dropdown based on provided items
 * TODO make clickable dropdown
 */
const Filter = ({
  field,
  label,
  items,
  filters,
  setFilters,
  activeFilter,
  setActiveFilter,
  dateRange,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [filterState, setFilterState] = useState({
    items,
    selectedItems: []
  });
  const initDateRangeState = [
    {
      startDate: undefined,
      endDate: undefined,
      // startDate: new Date(moment("2020-01-01").utc()),
      // endDate: new Date(moment().utc()),
      key: "selection"
    }
  ];
  const [dateRangeState, setDateRangeState] = useState(initDateRangeState);

  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      setFilterState({ ...filterState, selectedItems: [] });
    }
  }, [filters]);
  const nMax = items !== undefined ? items.length : 0;
  const nCur = filterState.selectedItems.length;

  // define element ID for menu
  const elId = field + "Dropdown";

  // Close filter if user clicks outside it
  if (show) {
    const onClick = e => {
      const el = document.getElementById(elId);
      if (el && el.contains(e.target)) {
        return;
      } else {
        window.removeEventListener("click", onClick);
        setShow(false);
      }
    };
    window.addEventListener("click", onClick);
  }

  const getInputLabel = selectedItems => {
    if (!dateRange)
      if (selectedItems.length === 1) {
        if (selectedItems[0].label.length < 15) return selectedItems[0].label;
        else return "1 selected";
      } else if (selectedItems.length === nMax) return "All selected";
      else if (selectedItems.length > 0) return "Multiple selected";
      else return "None selected";
    else {
      const startRaw = dateRangeState[0].startDate;
      const endRaw = dateRangeState[0].endDate;
      if (startRaw === undefined && endRaw === undefined) {
        return "None selected";
      }

      const start = moment(dateRangeState[0].startDate).utc();
      const end = moment(dateRangeState[0].endDate).utc();

      if (start.isSame(end, "day")) {
        return `${end.format("MMM D, YYYY")}`;
      } else if (start.isSame(end, "year")) {
        return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
      } else {
        return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
      }
    }
  };

  useEffect(() => {
    if (show) setActiveFilter(field);
    else if (activeFilter === field) setActiveFilter(null);
  }, [show]);

  useEffect(() => {
    if (activeFilter !== field) setShow(false);
  }, [activeFilter]);

  useEffect(() => {
    if (dateRange) {
      if (filters[field] === undefined) setDateRangeState(initDateRangeState);
    }
  }, [filters]);

  useEffect(() => {
    if (dateRange) {
      const startRaw = dateRangeState[0].startDate;
      const endRaw = dateRangeState[0].endDate;
      if (startRaw === undefined || endRaw === undefined) {
        return;
      } else {
        const v = [
          moment(dateRangeState[0].startDate)
            .utc()
            .format("YYYY-MM-DD"),
          moment(dateRangeState[0].endDate)
            .utc()
            .format("YYYY-MM-DD")
        ];
        setFilterState({
          ...filterState,
          selectedItems: v
        });
        // update filters
        setFilters({ ...filters, [field]: v });
      }
    }
  }, [dateRangeState]);

  return (
    <div className={styles.filter}>
      <div className={styles.label}>{label}</div>
      <div className={styles.input}>
        <div
          role="filterButton"
          className={classNames(styles.filterButton, {
            [styles.shown]: show,
            [styles.selected]: nCur > 0
          })}
          onClick={e => {
            if (activeFilter !== field) {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }
            setShow(!show);
          }}
        >
          <span>
            <span className={styles.field}>
              {getInputLabel(filterState.selectedItems)}
            </span>
            <span className={styles.selections}>
              {" "}
              {!dateRange && (
                <span>
                  ({nCur} of {nMax})
                </span>
              )}
            </span>
          </span>
          <i className={"material-icons"}>arrow_drop_down</i>
        </div>
        <div
          id={elId}
          className={classNames(styles.filterMenu, {
            [styles.shown]: show,
            [styles.dateRange]: dateRange
          })}
        >
          {!dateRange && (
            <MultiSelect
              wrapperClassName={styles.filterMenuWrapper}
              items={items}
              selectedItems={filterState.selectedItems}
              showSelectedItems={false}
              onChange={v => {
                setFilterState({
                  ...filterState,
                  selectedItems: v
                });

                // update filters
                setFilters({ ...filters, [field]: v.map(d => d.value) });
              }}
            />
          )}
          {dateRange && (
            <DateRange
              editableDateInputs={true}
              onChange={item => setDateRangeState([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRangeState}
              minDate={new Date("1/1/2020")}
              maxDate={new Date()}
              startDatePlaceholder={"Start date"}
              endDatePlaceholder={"End date"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
