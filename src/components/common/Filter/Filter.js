// standard packages
import React, { useState, useEffect } from "react";

// 3rd party modules
import MultiSelect from "@kenshooui/react-multi-select";
import { DateRange } from "react-date-range";
import moment from "moment";

// misc
import { isEmpty, arraysMatch } from "../../misc/Util";

// assets and styles
import calendarSvg from "../../../assets/icons/calendar.svg";
import styles from "./filter.module.scss";
import classNames from "classnames";
import "@kenshooui/react-multi-select/dist/style.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/**
 * @method Filter
 * create a clickable filter dropdown based on provided items
 */
const Filter = ({
  field,
  label,
  items,
  filters,
  disabledText,
  primary,
  setFilters,
  activeFilter,
  setActiveFilter,
  dateRange,
  minMaxDate,
  withGrouping = false,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const primaryFiltersOff =
    primary !== undefined &&
    (filters[primary] === undefined || filters[primary].length === 0);
  const noItems = items && items.length === 0;
  const disabled = primaryFiltersOff;
  const [filterState, setFilterState] = useState({
    items,
    selectedItems: []
  });
  const [showRangeSelection, setShowRangeSelection] = useState(false);
  const initDateRangeState = [
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection"
    }
  ];
  const [dateRangeState, setDateRangeState] = useState(initDateRangeState);

  // when master filter list is updated by the "clear" button or by closing
  // a badge, then update this filter's selected values to match
  useEffect(() => {
    if (isEmpty(filters)) {
      setFilterState({ ...filterState, selectedItems: [] });
      if (dateRange) {
        setDateRangeState(initDateRangeState);
      }
    } else {
      if (filters[field] !== undefined) {
        const curFilters = filterState.selectedItems;
        const newFilters = curFilters.filter(
          d => filters[field].includes(d.value) || filters[field].includes(d)
        );
        setFilterState({ ...filterState, selectedItems: newFilters });
      } else {
        setFilterState({ ...filterState, selectedItems: [] });
      }
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

  useEffect(() => {
    if (show) setActiveFilter(field);
    else if (activeFilter === field) setActiveFilter(null);
  }, [show]);

  useEffect(() => {
    if (activeFilter !== field) setShow(false);
  }, [activeFilter]);

  useEffect(() => {
    if (dateRange) {
      if (filters[field] === undefined) {
        setDateRangeState(initDateRangeState);
        setShowRangeSelection(false);
      }
    } else {
      // if this filter has a primary, update based on its values
      if (primary !== undefined) {
        const primaryFiltersOff =
          filters[primary] === undefined || filters[primary].length === 0;
        const thisFiltersOn =
          filters[field] !== undefined && filters[field].length > 0;
        if (primaryFiltersOff && thisFiltersOn) {
          const newFilters = { ...filters };
          delete newFilters[field];
          setFilters(newFilters);
        } else if (thisFiltersOn) {
          const newSelectedItems = filterState.selectedItems.filter(d => {
            return filters[primary].includes(d.group);
          });
          const newFilterState = { ...filterState };
          const newFilters = { ...filters };
          newFilters[field] = newSelectedItems.map(d => d.value);
          newFilterState.selectedItems = newSelectedItems;
          const mustUpdateFilters = !arraysMatch(
            filters[field],
            newFilters[field]
          );
          setFilterState(newFilterState);
          if (mustUpdateFilters) setFilters(newFilters);
        }
      }
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

  let responsiveHeight = 0;
  if (items !== undefined) {
    const hasGroup = items.length > 0 && items[0].group !== undefined;
    let nEntries = items.length;
    if (hasGroup) {
      const nGroups = [...new Set(items.map(d => d.group))].length;
      nEntries += nGroups;
    }
    responsiveHeight = items && nEntries < 5 ? (2 + nEntries) * 42 : 7 * 42;
  }

  return (
    <div
      className={classNames(styles.filter, {
        [styles.disabled]: disabled || noItems
      })}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.input}>
        <div
          role="filterButton"
          className={classNames(styles.filterButton, {
            [styles.shown]: show,
            [styles.selected]: nCur > 0,
            [styles.disabled]: disabled || noItems
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
              {getInputLabel({
                dateRange,
                items,
                nMax,
                dateRangeState,
                selectedItems: filterState.selectedItems,
                disabledText,
                disabled
              })}
            </span>
            <span className={styles.selections}>
              {" "}
              {!dateRange && !disabled && !noItems && (
                <span>
                  ({nCur} of {nMax})
                </span>
              )}
            </span>
          </span>
          {dateRange && <img src={calendarSvg} />}
          {!dateRange && <i className={"material-icons"}>arrow_drop_down</i>}
        </div>
        <div
          id={elId}
          className={classNames(styles.filterMenu, {
            [styles.shown]: show,
            [styles.dateRange]: dateRange
          })}
          onMouseDown={e => {
            // reveal blue selected range only when calendar has been
            // interacted with
            const el = e.target;
            const clickedCalDay =
              el.parentElement.classList.contains("rdrDayNumber") ||
              el.parentElement.classList.contains("rdrDay");
            if (!showRangeSelection && clickedCalDay)
              setShowRangeSelection(true);
          }}
        >
          {!dateRange && (
            <MultiSelect
              wrapperClassName={styles.filterMenuWrapper}
              items={items}
              withGrouping={withGrouping}
              selectedItems={filterState.selectedItems}
              showSelectedItems={false}
              responsiveHeight={responsiveHeight}
              onChange={v => {
                setFilterState({
                  ...filterState,
                  selectedItems: v
                });

                // update filters
                if (v.length > 0) {
                  setFilters({ ...filters, [field]: v.map(d => d.value) });
                } else {
                  const newFilters = { ...filters };
                  delete newFilters[field];
                  setFilters(newFilters);
                }
              }}
            />
          )}
          {dateRange && (
            <DateRange
              className={showRangeSelection ? "" : styles.hideRangeSelection}
              editableDateInputs={true}
              onChange={item => setDateRangeState([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRangeState}
              minDate={minMaxDate.min}
              maxDate={minMaxDate.max}
              startDatePlaceholder={"Start date"}
              endDatePlaceholder={"End date"}
              onPreviewChange={() => {
                // override default behavior when mousing over the calendar
                // in order to support custom styling
                return null;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Given input parameters returns the label that should be shown for the
 * filter dropdown.
 * @method getInputLabel
 * @param  {[type]}      dateRange      [description]
 * @param  {[type]}      nMax           [description]
 * @param  {[type]}      dateRangeState [description]
 * @param  {[type]}      selectedItems  [description]
 * @return {[type]}                     [description]
 */
export const getInputLabel = ({
  dateRange,
  nMax,
  dateRangeState,
  items,
  selectedItems,
  disabledText,
  disabled
}) => {
  if (!dateRange) {
    // if this filter has a primary and it isn't active, disable it
    if (!disabled && items && items.length === 0) {
      return "No options";
    } else if (disabled) {
      return disabledText;
    }
    if (selectedItems.length === 1) {
      if (selectedItems[0].label.length < 15) return selectedItems[0].label;
      else return "1 selected";
    } else if (selectedItems.length === nMax) return "All selected";
    else if (selectedItems.length > 0) return "Multiple selected";
    else return "None selected";
  } else {
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

export default Filter;
