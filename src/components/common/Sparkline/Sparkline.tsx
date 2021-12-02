import { Moment } from "moment";
import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "./sparkline.module.scss";
import * as FMT from "components/misc/FormatAndDisplay/FormatAndDisplay";
import { SparklineChart } from "./content/SparklineChart";
import { NumericObservation } from "../MapboxMap/plugins/mapTypes";
import classNames from "classnames";
import { Numeric } from "d3";
import { getDatumByDate } from "./helpers";
import { SparklineCustomOptions } from "../D3React/types";
import moment from "moment";
type ComponentProps = {
  width: number;
  height: number;
  data: NumericObservation[] | null;
  dataDate: Moment;
  unit: string[];
  label: string | null;
  caption?: string;
  footer?: string;
  classes: string[];
  customOptions?: SparklineCustomOptions;
};
export const Sparkline: FunctionComponent<ComponentProps> = ({
  width,
  height,
  data,
  dataDate,
  unit,
  label,
  caption,
  footer,
  classes = [],
  customOptions = {},
}) => {
  // date shown in sparkline -- defaults to most recent date on or before the
  // dataDate for which data are available
  // const [date, setDate] = useState<Moment>(moment("2021-06-01"));
  const [date, setDate] = useState<Moment>(dataDate);

  // update display date when data date is updated
  useEffect(() => {
    // setDate(moment("2021-06-01"));
    setDate(dataDate);
  }, [dataDate]);

  if (data !== null && data !== undefined && data.length > 0) {
    const curDatum: NumericObservation | undefined = getDatumByDate(data, date);
    const curValue: number | Numeric | null = getCurValue(curDatum);
    const dataAvail: boolean = curValue !== null;
    return (
      <div className={classNames(styles.sparkline, ...classes)}>
        <div className={styles.valueAndUnit}>
          {dataAvail && (
            <>
              <span className={styles.value}>
                <FMT.ExactNumber>{curValue}</FMT.ExactNumber>
              </span>{" "}
              <span className={styles.unit}>
                {curValue === 1 ? unit[0] : unit[1]}
              </span>
            </>
          )}
          {!dataAvail && <span className={styles.value}>No data for date</span>}
        </div>
        <div className={styles.label}>{label}</div>
        <SparklineChart
          {...{
            width,
            height,
            data,
            dataDate,
            // dataDate: moment("2021-06-01"),
            caption,
            footer,
            customOptions,
          }}
        />
      </div>
    );
  } else
    return (
      <span className={styles.noData}>
        {customOptions.noDataText || "No data to show."}
      </span>
    );
};
export default Sparkline;

/**
 * Given the datum representing the current date in a temporal data series,
 * returns its value attribute, or zero if it is negative, or null if the datum
 * does not exist.
 *
 * @param curDatum The datum for the current date in the temporal data series
 * @returns The value for the datum if it exists, set to zero if negative, or
 * null if the datum does not exist.
 */
function getCurValue(
  curDatum: NumericObservation | undefined
): number | Numeric | null {
  if (
    curDatum !== undefined &&
    curDatum.value !== undefined &&
    curDatum.value !== null
  ) {
    return Math.max(curDatum.value as number, 0);
  } else return null;
}
