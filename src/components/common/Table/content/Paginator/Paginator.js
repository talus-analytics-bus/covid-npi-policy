// standard packages
import React, { useState } from "react";

// assets and styles
import styles from "./paginator.module.scss";
import classNames from "classnames";
import { comma } from "../../../../misc/Util";

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
  // max records to show on 'All' selection
  const maxRecords = 1e9;

  // max pagination buttons to show at once
  const maxButtons = 8;

  // pagination buttons to show
  const numPages = Math.ceil(nTotalRecords / pagesize);

  const PageButton = ({
    label = null,
    iconName = null,
    onClick,
    customClassNames = {},
  }) => {
    const icon =
      iconName !== null ? (
        <i className={classNames("material-icons")}>{iconName}</i>
      ) : null;

    return (
      <button className={classNames(customClassNames)} {...{ onClick }}>
        {icon}
        {label}
      </button>
    );
  };

  // add "first" and "next" buttons
  // add middle buttons

  let firstButtonNum = curPage;
  let lastButtonNum = numPages;
  if (curPage < maxButtons / 2) {
    firstButtonNum = curPage;
    lastButtonNum = maxButtons;
  }

  const onLastPage = curPage >= numPages;
  const onFirstPage = curPage <= 1;
  const prevButton = PageButton({
    onClick: () => {
      if (!onFirstPage) setCurPage(curPage - 1);
    },
    customClassNames: {
      [styles.disabled]: onFirstPage,
    },
    iconName: "keyboard_arrow_left",
  });
  const nextButton = PageButton({
    onClick: () => {
      if (!onLastPage) setCurPage(curPage + 1);
    },
    customClassNames: {
      [styles.disabled]: onLastPage,
    },
    iconName: "keyboard_arrow_right",
  });

  let i = 0;

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
      <div className={styles.pageButtons}>
        {prevButton}
        {firstButtonNum} {lastButtonNum}
        {nextButton}
      </div>
    </div>
  );
};

export default Paginator;
