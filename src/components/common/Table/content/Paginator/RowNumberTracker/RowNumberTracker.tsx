import { FC } from "react";
import styles from "../paginator.module.scss";
import { comma } from "../../../../../misc/Util";
import { Pagesize } from "../../../Table";

interface RowNumberTrackerProps {
  curPage: number;
  nTotalRecords: number;
  pagesize: Pagesize;
}
export const RowNumberTracker: FC<RowNumberTrackerProps> = ({
  pagesize,
  curPage,
  nTotalRecords,
}) => {
  return (
    <div className={styles.rowNumberTracker}>
      {pagesize !== "All" && (
        <>
          Showing {comma(curPage * pagesize - pagesize + 1)} to{" "}
          {comma(Math.min(curPage * pagesize, nTotalRecords))} of{" "}
          {comma(nTotalRecords)} rows
        </>
      )}
      {pagesize === "All" && <>Showing x to y rows</>}
    </div>
  );
};
