// standard modules
import React, { useEffect, useState } from "react";
import styles from "./table.module.scss";
import classNames from "classnames";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";

// utilities and common components
import { comma } from "../../misc/Util";
import { ShowMore } from "../../common/";
import { Paginator } from "./content/Paginator/Paginator";

// assets
import asc from "../../../assets/icons/table/sorted-asc.svg";
import desc from "../../../assets/icons/table/sorted-desc.svg";
import unsorted from "../../../assets/icons/table/unsorted.svg";

const Table = ({
  name,
  data,
  columns,
  dataGetter,
  childGetter,
  defaultSortedField,
  className,
  nTotalRecords,
  curPage,
  setCurPage,
  pagesize,
  setPagesize,
  ...props
}) => {
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
    d.sortFunc = (a, b, order, dataField) => {
      return 1;
    };
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
    },
  };

  // table is expandable if at least on row has children to show
  const expandable = data.some(d => d.children !== undefined);
  const defaultSorted = [
    {
      dataField: defaultSortedField,
      order: "desc",
    },
  ];

  return (
    <>
      <div className={styles.table}>
        <ToolkitProvider keyField="id" data={data} columns={columns} search>
          {props => (
            <div>
              <SearchBar
                {...{ ...props.searchProps, placeholder: "search for..." }}
              />
              <BootstrapTable
                expandRow={expandable ? expandRow : undefined}
                classes={classNames({
                  [styles.expandable]: expandable,
                  [className]: true,
                })}
                {...props.baseProps}
                defaultSorted={defaultSorted}
              />
            </div>
          )}
        </ToolkitProvider>
      </div>
      <Paginator
        {...{
          setPagesize,
          pagesize,
          curPage,
          setCurPage,
          nTotalRecords,
        }}
      />
    </>
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
