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
  customOptions,
}) => {
  // date shown in sparkline
  const [date, setDate] = useState<Moment>(dataDate);

  // update display date when data date is updated
  useEffect(() => {
    setDate(dataDate);
  }, [dataDate]);

  if (data !== null && data !== undefined && data.length > 0) {
    const curDatum: NumericObservation | undefined = getDatumByDate(data, date);
    const curValue: number | Numeric =
      curDatum !== undefined &&
      curDatum.value !== undefined &&
      curDatum.value !== null
        ? curDatum.value
        : 0;
    return (
      <div className={classNames(styles.sparkline, ...classes)}>
        <div className={styles.valueAndUnit}>
          <span className={styles.value}>
            <FMT.ExactNumber>{curValue}</FMT.ExactNumber>
          </span>{" "}
          <span className={styles.unit}>
            {curValue === 1 ? unit[0] : unit[1]}
          </span>
        </div>
        <div className={styles.label}>{label}</div>
        <SparklineChart
          {...{
            width,
            height,
            data,
            dataDate,
            caption,
            footer,
            customOptions,
          }}
        />
      </div>
    );
  } else return <span>No data to show.</span>;
};
export default Sparkline;
