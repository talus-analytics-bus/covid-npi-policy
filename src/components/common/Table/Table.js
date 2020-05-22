// standard modules
import React, { useEffect, useState } from "react";
import styles from "./table.module.scss";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";

// utilities and common components
import { comma } from "../../misc/Util";
import { ShowMore } from "../../common/";

// assets
import asc from "../../../assets/icons/table/sorted-asc.svg";
import desc from "../../../assets/icons/table/sorted-desc.svg";
import unsorted from "../../../assets/icons/table/unsorted.svg";

const Table = ({ name, data, columns, dataGetter, childGetter, ...props }) => {
  // define search bar
  const { SearchBar } = Search;

  // define custom design for sort carets
  const sortCaret = (order, column) => {
    if (!order) return <img className={styles.sortable} src={unsorted} />;
    else if (order === "asc")
      return <img className={styles.sortable} src={asc} />;
    else if (order === "desc")
      return <img className={styles.sortable} src={desc} />;
    return null;
  };

  // for each column, specify various constants, including the null value,
  // sort carets, etc.
  columns.forEach(d => {
    d.sortCaret = sortCaret;
    if (d.definition) {
      d.text = (
        <div>
          <p>{d.header}</p>
          <p className={styles.definition}>
            {<ShowMore text={d.definition} charLimit={d.defCharLimit || 30} />}
          </p>
        </div>
      );
    } else {
      d.text = (
        <div>
          <p>{d.header}</p>
        </div>
      );
    }
    if (d.formatter === undefined)
      d.formatter = cell =>
        !cell || cell === "Unspecified" ? (
          <span className={styles.unspecified}>{"Unspecified"}</span>
        ) : (
          cell
        );
  });

  // define rows as non-expandable if they have no children
  const nonExpandable = data
    .map((d, i) => {
      if (d.children === undefined || d.children.length === 0) return i + 1;
      else return undefined;
    })
    .filter(d => d !== undefined);

  // define how expandable rows should be rendered (e.g., note logs)
  // TODO move the notes-specific content out of this file, eventually
  const expandRow = {
    parentClassName: styles.expandedParent,
    nonExpandable,
    renderer: row => {
      if (row.children && row.children.length > 0)
        return (
          <div className={styles.children}>
            {row.children.map((d, i) => (
              <div>{d}</div>
            ))}
          </div>
        );
    }
  };

  // define threshold at which to show pagination controls
  const paginationThresh = 0;

  // define pagination options for Bootstrap table
  const customTotal = (from, to, size) => (
    <span className={styles.paginationTotal}>
      Showing {comma(from)} to {comma(to)} of {comma(size)} records
    </span>
  );
  const paginationOptions = {
    paginationSize: 10,
    pageStartIndex: 1,
    // alwaysShowAllBtns: true, // Always show next and previous button
    // withFirstAndLast: false, // Hide the going to First and Last page button
    // hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: "First",
    prePageText: "Back",
    nextPageText: "Next",
    lastPageText: "Last",
    nextPageTitle: "First page",
    prePageTitle: "Pre page",
    firstPageTitle: "Next page",
    lastPageTitle: "Last page",
    showTotal: true,
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPageList: [
      {
        text: "10",
        value: 10
      },
      {
        text: "50",
        value: 50
      },
      {
        text: "All",
        value: data.length
      }
    ]
  };

  // define pagination factory if record count is above pagination threshold
  const pagination =
    data.length > paginationThresh
      ? paginationFactory(paginationOptions)
      : undefined;

  // table is expandable if at least on row has children to show
  const expandable = data.some(d => d.children !== undefined);
  const defaultSorted = [
    {
      dataField: "date_start_effective",
      order: "desc"
    }
  ];
  // main jsx for Bootstrap table
  return (
    <div className={styles.table}>
      <ToolkitProvider keyField="id" data={data} columns={columns} search>
        {props => (
          <div>
            <SearchBar
              {...{ ...props.searchProps, placeholder: "search for..." }}
            />
            <BootstrapTable
              pagination={pagination}
              expandRow={expandable ? expandRow : undefined}
              classes={{ [styles.expandable]: expandable }}
              {...props.baseProps}
              defaultSorted={defaultSorted}
            />
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
  // const defaultSorted = [
  //   {
  //     dataField: "date_issued",
  //     order: "desc"
  //   }
  // ];
  // // main jsx for Bootstrap table
  // return (
  //   <div className={styles.table}>
  //     <BootstrapTable
  // defaultSorted={defaultSorted}
  //       keyField={"id"}
  //       data={data}
  //       columns={columns}
  //     />
  //   </div>
  // );
};
export default Table;
