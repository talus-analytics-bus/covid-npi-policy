import React from "react";
import moment from "moment";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { DateRange } from "react-date-range";

import ExpandingSection from "../../PolicyList/ExpandingSection/ExpandingSection";

import styles from "./DateRangeControl.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

export const dateRangeLabel = dateRange => {
  if (!dateRange.startDate || !dateRange.endDate) return "Select Date Range";

  const start = moment(dateRange.startDate).utc();
  const end = moment(dateRange.endDate).utc();

  if (start.isSame(end, "day")) {
    return `${end.format("MMM D, YYYY")}`;
  } else if (start.isSame(end, "year")) {
    return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
  } else {
    return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
  }
};

const DateRangeControl = props => {
  const { setPolicyFilters, setStatus, setPolicyObject } = React.useContext(
    policyContext
  );

  const [dateRange, setDateRange] = React.useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const unedited = !dateRange.startDate && !dateRange.endDate;

  const onChangeDateRange = event => {
    setDateRange(event.selection);
    if (event.selection.startDate !== event.selection.endDate) {
      setPolicyObject({});
      setPolicyFilters(prev => ({
        ...prev,
        dates_in_effect: [
          event.selection.startDate.toISOString().substring(0, 10),
          event.selection.endDate.toISOString().substring(0, 10),
        ],
      }));
      setStatus(prev => ({
        ...prev,
        policies: "initial",
        searchResults: "initial",
      }));
    }
  };

  return (
    <div className={styles.datePicker}>
      <ExpandingSection
        floating
        open={datePickerOpen}
        onOpen={() => setDatePickerOpen(true)}
        onClose={() => setDatePickerOpen(false)}
      >
        <span className={styles.buttonLabel}>{dateRangeLabel(dateRange)}</span>
        <div className={styles.datePickerFrame}>
          <DateRange
            editableDateInputs
            className={unedited ? styles.hideRangeSelection : ""}
            rangeColors={unedited ? ["#fff"] : ["#4D6E78"]}
            moveRangeOnFirstSelection={false}
            startDatePlaceholder={"Start date"}
            endDatePlaceholder={"End date"}
            ranges={[dateRange]}
            onChange={event => onChangeDateRange(event)}
          />
        </div>
      </ExpandingSection>
    </div>
  );
};

export default DateRangeControl;
