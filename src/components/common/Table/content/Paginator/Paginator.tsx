// standard packages
import { Dispatch, SetStateAction, FC } from "react";

// assets and styles
import styles from "./paginator.module.scss";
import { comma } from "../../../../misc/Util";
import { Pagesize } from "../../Table";
import { PageButton } from "./PageButton/PageButton";
import { RowNumberTracker } from "./RowNumberTracker/RowNumberTracker";

interface PaginatorProps {
  /**
   * The current page.
   */
  curPage: number;

  /**
   * Function to set the current page.
   */
  setCurPage: Dispatch<SetStateAction<number>>;

  /**
   * The total number of records in the table, across all pages.
   */
  nTotalRecords: number | null;

  /**
   * The currently selected pagesize.
   */
  pagesize: Pagesize;

  /**
   * Function to set the currently selected pagesize.
   */
  setPagesize: Dispatch<SetStateAction<Pagesize>>;

  /**
   * The text to show if no records are in the table. Defaults to "No data
   * match selected filters".
   */
  noDataText?: string;
}

/**
 * @method Paginator
 * Handle custom pagination for `Table` component
 */
export const Paginator: FC<PaginatorProps> = ({
  curPage,
  setCurPage,
  nTotalRecords,
  pagesize,
  setPagesize,
  noDataText = "No data match selected filters",
}) => {
  if (nTotalRecords === null || nTotalRecords === 0) return <i>{noDataText}</i>;

  // constants
  // max records to show on 'All' selection
  const maxRecords = 1e9;

  // max pagination buttons to show at once
  const maxButtons = 9; // make odd
  const middleMax = (maxButtons - 1) / 2;

  // pagination buttons to show
  const numPages = pagesize !== "All" ? Math.ceil(nTotalRecords / pagesize) : 1;

  // add "first" and "next" buttons
  // add middle buttons
  let firstButtonNum = Math.max(
    Math.min(Math.max(curPage - middleMax, 1), numPages - maxButtons + 1),
    1
  );
  let lastButtonNum = Math.min(firstButtonNum + maxButtons - 1, numPages);

  const middleButtons = [];
  let i = firstButtonNum;
  while (i < lastButtonNum + 1) {
    const page = i;
    middleButtons.push(
      PageButton({
        label: comma(page),
        customClassNames: { [styles.selected]: curPage === page },
        onClick: () => {
          setCurPage(page);
        },
      })
    );
    i++;
  }
  const onLastPage = curPage >= numPages;
  const onFirstPage = curPage <= 1;

  // first page
  const firstButton = PageButton({
    label: "«",
    onClick: () => {
      if (!onFirstPage) setCurPage(1);
    },
    customClassNames: {
      [styles.disabled]: onFirstPage,
      [styles.control]: true,
    },
  });

  // previous page
  const prevButton = PageButton({
    label: "‹",
    onClick: () => {
      if (!onFirstPage) setCurPage(curPage - 1);
    },
    customClassNames: {
      [styles.disabled]: onFirstPage,
      [styles.control]: true,
    },
  });

  // next page
  const nextButton = PageButton({
    label: "›",
    onClick: () => {
      if (!onLastPage) setCurPage(curPage + 1);
    },
    customClassNames: {
      [styles.disabled]: onLastPage,
      [styles.control]: true,
    },
  });

  // last page
  const lastButton = PageButton({
    label: "»",
    onClick: () => {
      if (!onLastPage) setCurPage(numPages);
    },
    customClassNames: {
      [styles.disabled]: onLastPage,
      [styles.control]: true,
    },
  });

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
      <div className={styles.leftSide}>
        <div className={styles.pagesizePicker}>
          <label>Page size</label>
          <select
            value={pagesize}
            onChange={e => {
              const v: any = e.target.value;
              let updatedPagesize: Pagesize;
              if (typeof v === "string" && v === "All") updatedPagesize = "All";
              else updatedPagesize = v;
              setPagesize(updatedPagesize);
            }}
          >
            {pagesizeOptions.map(d => (
              <option value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        {<RowNumberTracker {...{ pagesize, curPage, nTotalRecords }} />}
      </div>
      <div className={styles.rightSide}>
        <div className={styles.pageButtons}>
          {firstButton}
          {prevButton}
          {middleButtons}
          {nextButton}
          {lastButton}
        </div>
      </div>
    </div>
  );
};

export default Paginator;
