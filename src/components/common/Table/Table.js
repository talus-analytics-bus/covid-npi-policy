// standard modules
import React from "react";
import styles from "./table.module.scss";
import classNames from "classnames";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";

// utilities and common components
import { Paginator } from "./content/Paginator/Paginator";

// assets
import asc from "../../../assets/icons/table/sorted-asc.svg";
import desc from "../../../assets/icons/table/sorted-desc.svg";
import unsorted from "../../../assets/icons/table/unsorted.svg";

const Table = ({
  data,
  columns,
  defaultSortedField,
  className,
  nTotalRecords,
  curPage,
  setCurPage,
  pagesize,
  setPagesize,
}) => {
  // define custom design for sort carets
  const sortCaret = order => {
    if (!order)
      return (
        <img className={styles.sortable} src={unsorted} alt={"Unsorted icon"} />
      );
    else if (order === "asc")
      return (
        <img
          className={styles.sortable}
          src={asc}
          alt={"Ascending sort caret"}
        />
      );
    else if (order === "desc")
      return (
        <img
          className={styles.sortable}
          src={desc}
          alt={"Descending sort caret"}
        />
      );
    return null;
  };

  // for each column, specify various constants, including the null value,
  // sort carets, etc.
  columns.forEach(d => {
    d.sortFunc = () => {
      return 1;
    };
    // d.sortFunc = (a, b, order, dataField) => {
    //   return 1;
    // };
    d.sortCaret = sortCaret;
    if (d.definition) {
      d.text = (
        <div>
          <p>{d.header}</p>
          <p className={styles.definition}>{d.definition}</p>
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

  // define how expandable rows should be rendered
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

  // Return component with paginator
  return (
    <>
      <div className={styles.table}>
        <ToolkitProvider keyField="id" data={data} columns={columns}>
          {props => (
            <div>
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
};
export default Table;
