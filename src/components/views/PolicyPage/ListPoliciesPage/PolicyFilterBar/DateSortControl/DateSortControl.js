import React from "react";

import styles from "./DateSortControl.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const DateSort = props => {
  const {
    setPolicySort,
    setStatus,
    setPolicyObject,
    policySort,
  } = React.useContext(policyContext);

  return (
    <select
      className={styles.dateSort}
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
  );
};

export default DateSort;
