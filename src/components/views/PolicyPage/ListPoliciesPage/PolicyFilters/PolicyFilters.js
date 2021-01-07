import React from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// import MultiSelect from "@kenshooui/react-multi-select";
import { DateRange } from "react-date-range";

import ExpandingSection from "../PolicyList/ExpandingSection/ExpandingSection";

import styles from "./PolicyFilters.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

// const API_URL = process.env.REACT_APP_API_URL;

const PolicyFilters = props => {
  const {
    setPolicyFilters,
    setPolicySort,
    setStatus,
    setPolicyObject,
    policySort,
  } = React.useContext(policyContext);

  // const location = useLocation();
  // const [iso3, state] = location.pathname
  //   .replace(/\/$/, "")
  //   .split("/")
  //   .slice(-2);

  //   React.useEffect(() => {
  //     const getOptions = async () => {
  //       const testreq = await axios(`${API_URL}/get/optionset`, {
  //         params: {
  //           class_name: "Policy",
  //           fields: "Policy.policy_target",
  //         },
  //       });
  //
  //       console.log("options");
  //       console.log(testreq);
  //     };
  //
  //     getOptions();
  //   }, [iso3, state]);

  // const options = [""];

  const [dateRange, setDateRange] = React.useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });

  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const unedited = !dateRange.startDate && !dateRange.endDate;

  return (
    <div>
      <select
        value={policySort}
        onChange={() => {
          setPolicyObject({});
          setPolicySort(policySort === "desc" ? "asc" : "desc");
          setStatus(prev => ({ ...prev, policies: "initial" }));
        }}
      >
        <option value="asc">Newest policies last</option>
        <option value="desc">Newest policies first</option>
      </select>
      <ExpandingSection
        floating
        zIndex={10}
        open={datePickerOpen}
        onOpen={() => setDatePickerOpen(true)}
        onClose={() => setDatePickerOpen(false)}
      >
        Select Date
        <DateRange
          editableDateInputs
          className={unedited ? styles.hideRangeSelection : ""}
          rangeColors={unedited ? ["#fff"] : ["#4D6E78"]}
          moveRangeOnFirstSelection={false}
          startDatePlaceholder={"Start date"}
          endDatePlaceholder={"End date"}
          ranges={[dateRange]}
          onChange={item => setDateRange(item.selection)}
        />
      </ExpandingSection>
    </div>
  );
};

export default PolicyFilters;
