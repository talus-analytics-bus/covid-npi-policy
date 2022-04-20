// standard modules
import React, { Dispatch, SetStateAction } from "react";
import styles from "./table.module.scss";
import classNames from "classnames";

import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit";
// import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

// utilities and common components
import { Paginator } from "./content/Paginator/Paginator";

// assets
import asc from "../../../assets/icons/table/sorted-asc.svg";
import desc from "../../../assets/icons/table/sorted-desc.svg";
import unsorted from "../../../assets/icons/table/unsorted.svg";
import { ReactElement } from "react";

/**
 * Type of pagesize, which can be a number (of records per page) or "All".
 */
export type Pagesize = number | "All";

/**
 * Fields required for data column definitions.
 */
export type DataColumnDef = {
  dataField: string;
  defKey: string;
  header: string;
  onSort(field: string, order: number): void;
  sort: boolean;
  sortValue(cell: any, row: Object): any;
  // sortFunc(a: any, b: any, order: number, dataField: string): number;
  formatter(cell: any, row: Object): any;
  sortCaret?(...args: any[]): ReactElement | null;
  definition?: string | ReactElement;
  text?: string | ReactElement;
};

interface TableProps {
  name?: string;
  data: (Object & { children?: ReactElement[] })[];
  columns: DataColumnDef[];
  defaultSortedField?: string;
  className?: string;
  nTotalRecords?: number | null;
  curPage?: number;
  setCurPage?: Dispatch<SetStateAction<number>>;
  pagesize?: Pagesize;
  setPagesize?: Dispatch<SetStateAction<Pagesize>>;
  showDefinitions?: boolean;
}

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
  showDefinitions = false,
}: TableProps): ReactElement => {
  // define custom design for sort carets
  const sortCaret = (order: "asc" | "desc") => {
    if (!order)
      return (
        <img className={styles.sortable} src={unsorted} alt={"Unsorted icon"} />
      );
    else if (order === "asc")
      return (
        <img
          className={styles.sortable}
          src={asc}
          alt={"Ascending sort icon"}
        />
      );
    else if (order === "desc")
      return (
        <img
          className={styles.sortable}
          src={desc}
          alt={"Descending sort icon"}
        />
      );
    return null;
  };

  // for each column, specify various constants, including the null value,
  // sort carets, etc.
  columns.forEach(d => {
    // d.sortFunc = (a: any, b: any, order: number, dataField: string) => {
    //   return 1;
    // };
    d.sortCaret = sortCaret;
    if (d.definition) {
      d.text = (
        <div title={!showDefinitions ? (d.definition as string) : undefined}>
          <p>{d.header}</p>
          {showDefinitions && (
            <p className={styles.definition}>{d.definition}</p>
          )}
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
    renderer: (row: Record<string, any>) => {
      if (row.children && row.children.length > 0)
        return (
          <div className={styles.children}>
            {row.children.map((d: any) => (
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

  // TKP component with search bar enabled
  // <ToolkitProvider keyField="id" data={data} columns={columns} search>

  return (
    <>
      <div className={styles.table}>
        <ToolkitProvider keyField="id" data={data} columns={columns}>
          {props => (
            <div>
              {
                // <SearchBar
                //   {...{ ...props.searchProps, placeholder: "search for..." }}
                // />
              }
              <BootstrapTable
                expandRow={expandable ? expandRow : undefined}
                classes={classNames(className, {
                  [styles.expandable]: expandable,
                })}
                {...props.baseProps}
                defaultSorted={defaultSorted}
              />
            </div>
          )}
        </ToolkitProvider>
      </div>
      {curPage !== undefined &&
        setCurPage !== undefined &&
        pagesize !== undefined &&
        setPagesize !== undefined &&
        nTotalRecords !== undefined && (
          <Paginator
            {...{
              setPagesize,
              pagesize,
              curPage,
              setCurPage,
              nTotalRecords,
            }}
          />
        )}
    </>
  );
};
export default Table;
