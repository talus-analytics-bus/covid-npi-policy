// standard packages
import React, { useState } from "react";

// assets and styles
import styles from "./paginator.module.scss";
import classNames from "classnames";

/**
 * @method Paginator
 * Handle custom pagination for `Table` component
 */
export const Paginator = ({
  curPage,
  setCurPage,
  nTotalRecords,
  pagesize,
  setPagesize,
}) => {
  // constants
  const maxRecords = 1e9;
  // state
  // pagesize selector
  const pagesizeOptions = [
    {
      label: 5,
      value: 5,
    },
    {
      label: 10,
      value: 10,
    },
    {
      label: 25,
      value: 25,
    },
    {
      label: 50,
      value: 50,
    },
    {
      label: "All",
      value: maxRecords,
    },
  ];
  return (
    <div className={styles.paginator}>
      <div className={styles.pagesizePicker}>
        <select
          value={pagesize}
          onChange={e => {
            const v = e.target.value;
            setPagesize(v);
          }}
        >
          {pagesizeOptions.map(d => (
            <option value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Paginator;
