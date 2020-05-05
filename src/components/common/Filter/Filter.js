// standard packages
import React, { useState, useEffect } from "react";

// 3rd party modules
import MultiSelect from "@kenshooui/react-multi-select";
import { DateRange } from "react-date-range";
import moment from "moment";

// misc
import { isEmpty } from "../../misc/Util";

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
  setFilters,
  activeFilter,
  setActiveFilter,
  dateRange,
  minMaxDate,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [filterState, setFilterState] = useState({
    items,
    selectedItems: []
  });
  const [showRangeSelection, setShowRangeSelection] = useState(false);
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

  // when master filter list is updated by the "clear" button or by closing
  // a badge, then update this filter's selected values to match
  useEffect(() => {
    if (isEmpty(filters)) {
      // const newFilterState = { ...filterState };
      // delete newFilterState[field];
      // setFilterState(newFilterState);
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
              {getInputLabel({
                dateRange,
                nMax,
                dateRangeState,
                selectedItems: filterState.selectedItems
              })}
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
              selectedItems={filterState.selectedItems}
              showSelectedItems={false}
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
  selectedItems
}) => {
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

export default Filter;
