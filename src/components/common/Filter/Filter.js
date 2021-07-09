// standard packages
import React, { useState, useEffect } from "react";

// 3rd party modules
import MultiSelect from "@kenshooui/react-multi-select";
import { DateRange } from "react-date-range";
import moment from "moment";

// misc and common components
import { RadioToggle } from "../../common";
import { arraysMatch } from "../../misc/Util";
import { isEmpty } from "../../misc/UtilsTyped";

// assets and styles
import calendarSvg from "../../../assets/icons/calendar.svg";
import styles from "./filter.module.scss";
import classNames from "classnames";
import "@kenshooui/react-multi-select/dist/style.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getFilterDisplayVals } from "../FilterSet/content/FilterSetSelections/FilterSetSelections";

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
  className,
  params = {},
  ...props
}) => {
  const [show, setShow] = useState(false);
  let initSelectedItems;
  if (!dateRange && items !== undefined) {
    initSelectedItems =
      filters[field] !== undefined
        ? items.filter(d => filters[field].includes(d.value))
        : [];
  } else {
    initSelectedItems = filters[field] !== undefined ? filters[field] : [];
  }
  const primaryFiltersOff =
    primary !== undefined &&
    (filters[primary] === undefined || filters[primary].length === 0);
  const noItems = items && items.length === 0;
  const disabled = primaryFiltersOff;

  // sort items so selected items are first
  const labeledItems =
    items !== undefined
      ? items.map(d => {
          if (d.label === undefined) d.label = d.value;
          return d;
        })
      : [];
  const sortedItems = labeledItems !== undefined ? [...labeledItems] : [];
  if (initSelectedItems.length > 0 && props.radio !== true) {
    const selectedIds = initSelectedItems.map(d => d.id);
    sortedItems.sort(function selectedFirst(a, b) {
      if (selectedIds.includes(a.id)) {
        if (selectedIds.includes(b.id)) {
          if (a.label > b.label) return 1;
          else return -1;
        } else return -1;
      } else if (selectedIds.includes(b.id)) {
        if (selectedIds.includes(a.id)) {
          if (b.label > a.label) return -1;
          else return 1;
        } else return 1;
      }
      return 0;
    });
  }
  const [filterState, setFilterState] = useState({
    sortedItems,
    selectedItems: initSelectedItems,
  });
  const [showRangeSelection, setShowRangeSelection] = useState(false);
  const initDateRangeState = [
    {
      startDate:
        initSelectedItems.length > 0
          ? new Date(moment(initSelectedItems[0]))
          : undefined,
      endDate:
        initSelectedItems.length > 0
          ? new Date(moment(initSelectedItems[1]))
          : undefined,
      key: "selection",
    },
  ];
  const [dateRangeState, setDateRangeState] = useState(initDateRangeState);

  const nMax = sortedItems !== undefined ? sortedItems.length : 0;
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
    // TODO fix dependencies below
    // eslint-disable-next-line
  }, [show]);

  useEffect(() => {
    if (activeFilter !== field) setShow(false);
    // TODO fix dependencies below
    // eslint-disable-next-line
  }, [activeFilter]);

  useEffect(() => {
    if (dateRange) {
      if (filters[field] === undefined || filters[field].length === 0) {
        setDateRangeState(initDateRangeState);
        setShowRangeSelection(false);
      }
    } else {
      // update filter state
      let updatedSelectedItems = null;
      if (isEmpty(filters)) {
        updatedSelectedItems = [];
        setFilterState({ ...filterState, selectedItems: updatedSelectedItems });
        if (dateRange) {
          setDateRangeState(initDateRangeState);
        }
      } else {
        if (filters[field] !== undefined) {
          // if (filters[field] !== undefined && items !== undefined) {

          const curFilters = filterState.selectedItems;
          const newFilters = curFilters.filter(
            d => filters[field].includes(d.value) || filters[field].includes(d)
          );

          updatedSelectedItems = newFilters;
          setFilterState({
            ...filterState,
            selectedItems: updatedSelectedItems,
          });
        } else {
          updatedSelectedItems = [];
          setFilterState({
            ...filterState,
            selectedItems: updatedSelectedItems,
          });
        }
      }

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
          const newSelectedItems = updatedSelectedItems.filter(d => {
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
        setFilterState({
          ...filterState,
          selectedItems: [],
        });
        return;
      } else {
        const v = [
          moment(dateRangeState[0].startDate)
            .utc()
            .format("YYYY-MM-DD"),
          moment(dateRangeState[0].endDate)
            .utc()
            .format("YYYY-MM-DD"),
        ];
        setFilterState({
          ...filterState,
          selectedItems: v,
        });
        // update filters
        setFilters({ ...filters, [field]: v });
      }
    }
    // TODO fix dependencies below
    // eslint-disable-next-line
  }, [dateRangeState]);

  const showSelectAll = sortedItems && sortedItems.length > 4;
  let responsiveHeight = 0;
  if (sortedItems !== undefined) {
    const hasGroup =
      sortedItems.length > 0 && sortedItems[0].group !== undefined;
    let nEntries = sortedItems.length;
    if (showSelectAll) nEntries++;
    if (hasGroup) {
      const nGroups = [...new Set(sortedItems.map(d => d.group))].length;
      nEntries += nGroups;
    }
    responsiveHeight = sortedItems && nEntries < 5 ? nEntries * 42 : 7 * 42;
  }
  if (props.radio !== true) {
    return (
      <div
        className={classNames(styles.filter, {
          [styles.disabled]: disabled || noItems,
          [styles.alignBottom]: props.alignBottom === true,
        })}
      >
        <div className={styles.label}>{label}</div>
        <div className={styles.input}>
          <div
            className={classNames(styles.filterButton, className, {
              [styles.shown]: show,
              [styles.selected]: nCur > 0,
              [styles.disabled]: disabled || noItems,
            })}
            onClick={e => {
              if (activeFilter !== field) {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }
              setShow(!show);
            }}
          >
            <div>
              {
                // // Show label of single selected items
                // <span className={styles.field}>
                //   {getInputLabel({
                //     dateRange,
                //     items: sortedItems,
                //     nMax,
                //     dateRangeState,
                //     selectedItems: filterState.selectedItems,
                //     disabledText,
                //     disabled,
                //   })}
                // </span>
              }
              {// show hyphen if no selections
              nCur === 0 && <>-</>}
              {// show number of selections if more than zero
              nCur > 0 && (
                <span className={styles.selections}>
                  {!dateRange && !disabled && !noItems && (
                    <span>
                      {nCur} of {nMax}
                    </span>
                  )}
                  {dateRange && (
                    <span>{getInputLabel({ dateRange, dateRangeState })}</span>
                  )}
                </span>
              )}
            </div>
            {dateRange && <img src={calendarSvg} alt={"calendar icon"} />}
            {!dateRange && <i className={"material-icons"}>arrow_drop_down</i>}
          </div>
          <div
            id={elId}
            className={classNames(styles.filterMenu, {
              [styles.shown]: show,
              [styles.dateRange]: dateRange,
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
                items={sortedItems}
                withGrouping={withGrouping}
                selectedItems={filterState.selectedItems}
                showSelectedItems={false}
                showSelectAll={showSelectAll}
                showSearch={showSelectAll}
                responsiveHeight={responsiveHeight}
                onChange={v => {
                  setFilterState({
                    ...filterState,
                    selectedItems: v,
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
                startDatePlaceholder={
                  params.startDatePlaceholder || "Start date"
                }
                endDatePlaceholder={params.endDatePlaceholder || "End date"}
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
  } else {
    const defaultRadioValue = props.defaultRadioValue;
    return (
      <RadioToggle
        {...{
          className,
          choices: sortedItems,
          curVal:
            isEmpty(filters) || isEmpty(filters[field])
              ? defaultRadioValue
              : filters[field],
          callback: v => {
            const vItem = sortedItems.find(d => d.value === v);
            setFilterState({
              ...filterState,
              selectedItems: [vItem],
            });

            // update filters?
            const doUpdate =
              filters[field] === undefined ||
              filters[field].length === 0 ||
              filters[field][0] !== vItem.value;
            if (doUpdate) setFilters({ ...filters, [field]: [vItem.value] });
          },
          label,
        }}
      />
    );
  }
};

const NO_SELECTION_TEXT = "-";
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
  disabled,
}) => {
  if (!dateRange) {
    // if this filter has a primary and it isn't active, disable it
    if (!disabled && items && items.length === 0) {
      return "No options";
    } else if (disabled) {
      return disabledText;
    }

    // // if there is one selection, show its label
    // if (selectedItems.length === 1) {
    //   // return label no matter how long
    //   return selectedItems[0].label;

    //   // // return label if it below 15 characters
    //   // const labelWillFit = selectedItems[0].label.length < 15;
    //   // if (labelWillFit) return selectedItems[0].label;
    //   // else return "1 selected";
    // }
    // // return descriptions of all or multiple selected, if applicable
    // } else if (selectedItems.length === nMax) return "All selected";
    // else if (selectedItems.length > 0) return "Multiple selected";
    else return NO_SELECTION_TEXT;
  } else {
    const startRaw = dateRangeState[0].startDate;
    const endRaw = dateRangeState[0].endDate;
    if (startRaw === undefined && endRaw === undefined) {
      return NO_SELECTION_TEXT;
    } else {
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
  }
};

export default Filter;
