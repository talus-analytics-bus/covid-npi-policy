import { Moment } from "moment";
import * as d3 from "d3";
// import ReactTooltip from "react-tooltip";

import React, {
  FunctionComponent,
  MutableRefObject,
  useRef,
  useState,
} from "react";
import styles from "./SparklineChart.module.scss";
import { Axes } from "src/components/common";
import { getHandleMouseMove } from "./helpers";
import { NumericObservation } from "src/components/common/MapboxMap/plugins/mapTypes";
import { SparklineCustomOptions } from "src/components/common/D3React/types";
import { parseStringAsMoment } from "src/components/misc/UtilsTyped";

type ComponentProps = {
  width: number;
  height: number;
  data: NumericObservation[];
  dataDate: Moment;
  caption?: string;
  footer?: string;
  customOptions?: SparklineCustomOptions;
};
export const SparklineChart: FunctionComponent<ComponentProps> = ({
  width,
  height,
  data,
  dataDate,
  caption,
  footer,
  customOptions,
}) => {
  // VARS
  const [lineVisible, setLineVisible] = useState<boolean>(false);
  const [mousePath, setMousePath] = useState<string>("");
  const chartRef: MutableRefObject<null> = useRef(null);
  const margin: Record<string, number> =
    customOptions !== undefined && customOptions.margin !== undefined
      ? customOptions.margin
      : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

  // create scales based on data and space to work in
  const xMinStr: string =
    customOptions !== undefined && customOptions.xMin !== undefined
      ? customOptions.xMin
      : data[0].date_time;
  const xMin: Moment = parseStringAsMoment(xMinStr);
  const xMax: Moment = parseStringAsMoment(data[data.length - 1].date_time);

  const [xDomain] = useState<[Moment, Moment]>([xMin, xMax]);

  // define y-domain from max y-value
  const yMaxTmp: number = d3.max(
    data,
    (d: NumericObservation) => d.value
  ) as number;
  const yMax: number = d3.max([yMaxTmp, 1]) as number;
  const yDomain: number[] = [0, yMax];

  const xScale = d3
    .scaleUtc()
    .domain(xDomain)
    .range([0, width]);
  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain(yDomain);

  // create line generator function
  const line = d3
    .line()
    //@ts-ignore TODO: rm this
    .x((d: NumericObservation) => xScale(parseStringAsMoment(d.date_time)))
    //@ts-ignore TODO: rm this
    .y((d: NumericObservation) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // get x-axis marker data for vertical line
  const dataDateStr: string = dataDate.format("YYYY-MM-DD");
  const xAxisMarkerOrigin: NumericObservation[] = [
    { date_time: xMinStr, value: 0 },
    { date_time: xMinStr, value: yMax },
  ];

  // define extra zero point at end of data series
  const extraZeroPoint: NumericObservation[] = [
    { date_time: xMax.format("YYYY-MM-DD"), value: 0 },
  ];
  // JSX
  return (
    <section className={styles.sparklineChart}>
      <figure>
        {data !== [] && (
          <svg
            width={width + margin.left + margin.right}
            height={height + margin.top + margin.bottom}
            viewBox={`0 0 ${width + margin.left + margin.right} ${height +
              margin.top +
              margin.bottom}`}
          >
            <g
              className={styles.chart}
              ref={chartRef}
              transform={`translate(${margin.left},${margin.top})`}
            >
              <path
                className={styles.xAxisMarker}
                //@ts-ignore TODO: rm this once typed correctly
                d={line(xAxisMarkerOrigin)}
                clipPath="url(#clip)"
                style={{
                  transform: `translate(${xScale(
                    parseStringAsMoment(dataDateStr)
                  )}px)`,
                }}
              />
              <Axes
                {...{
                  scale: { x: xScale, y: yScale },
                  dim: { height, width },
                  customOptions: {
                    yAxisLineVisible: false,
                    yGridlinesVisible: false,
                    xGridlinesVisible: false,
                    rightBoundaryVisible: false,
                    topBoundaryVisible: false,
                    yTickSize: 0,
                  },
                }}
              />
              <path
                className={styles.line}
                //@ts-ignore TODO: rm this once typed correctly
                d={line(data.concat(extraZeroPoint))}
                clipPath="url(#clip)"
              ></path>
              <g>
                <path
                  className={styles.mouseLine}
                  style={{ opacity: lineVisible ? 1 : 0 }}
                  d={mousePath}
                ></path>
                <rect
                  className={styles.chartAreaRect}
                  width={width}
                  height={height}
                  data-for="alertsChartTooltip"
                  data-tip=""
                  onMouseOver={() => {
                    // // @ts-ignore
                    // ReactTooltip.show();
                    setLineVisible(true);
                  }}
                  onMouseOut={() => setLineVisible(false)}
                  onMouseMove={getHandleMouseMove(xScale, setMousePath, height)}
                ></rect>
              </g>
            </g>
          </svg>
        )}
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
      {footer && <footer>{footer}</footer>}
      {
        // <ReactTooltip
        //   id="alertsChartTooltip"
        //   border={true}
        //   borderColor={"#d6d9e4"}
        //   place="right"
        //   type="light"
        //   effect="float"
        // >
        //   Tooltip content
        // </ReactTooltip>
      }
    </section>
  );
};
