/*
  Generates axes for chart

  CUSTOM OPTIONS (to be set as desired in props customOptions object)
  * length of tick marks (to hide them, set to 0)
      xTickSize, yTickSize
  * padding between ticks and tick labels
      xLabelPadding, yLabelPadding
  * target number of ticks on axis
      xNumTicks, yNumTicks
  * set whether main axis lines are visible
      xAxisLineVisible, yAxisLineVisible
  * set whether main grid lines are visible
      xGridlinesVisible, yGridlinesVisible
  * set whether additional chart boundary lines are visible
    only pertains to top and right sides of chart, axis lines
    treated separately
    NOTE: the normal gridlines might already be rendering a line
    at the top/right sides of the chart, regardless of these settings
      rightBoundaryVisible, topBoundaryVisible
  * custom tick formatters
      customXFormatter, customYFormatter
  * custom number of ticks
      customXNumTicks, customYNumTicks (not fully implemented yet)
  * set font to be larger by giving it a string value, eg: '2rem'
      largerFont
*/

// ---------- IMPORTS ----------
import React, { useMemo } from "react";
import { AxesProps } from "components/common/D3React/types";
import classNames from "classnames";
import styles from "./Axes.module.scss";

const Axes = ({ scale, dim, customOptions }: AxesProps) => {
  // ---------- TYPES ----------
  type TickProps = {
    value: Date | number;
    yOffset?: number;
    xOffset?: number;
    formattedValue: string;
  };

  // ---------- VARS ----------
  // set default values, if not provided
  const {
    xLabelsVisible = true,
    yLabelsVisible = true,
    xTickSize = 6,
    yTickSize = 6,
    xLabelPadding = 15,
    yLabelPadding = 5,
    xNumTicks = 5,
    yNumTicks = 5,
    xAxisLineVisible = true,
    yAxisLineVisible = true,
    xGridlinesVisible = true,
    yGridlinesVisible = true,
    rightBoundaryVisible = true,
    topBoundaryVisible = true,
    customXFormatter = null,
    customYFormatter = null,
    customXNumTicks = null,
    customYNumTicks = null,
    largerFont = null,
  } = customOptions;

  // calculate padding between labels and ticks
  const xPadding = xTickSize + xLabelPadding,
    yPadding = -yTickSize - yLabelPadding;

  // use d3 to generate ticks
  const xTicks = useMemo(() => {
    const numTicks = customXNumTicks || xNumTicks;
    return (
      scale.x
        //@ts-ignore
        .ticks(numTicks)
        .map((value: any) => {
          return {
            value,
            //@ts-ignore
            formattedValue: customXFormatter
              ? customXFormatter(value)
              : scale.x.tickFormat()(value),
            // formattedValue: d3.timeFormat()(value),
            xOffset: scale.x(value),
          };
        })
    );
  }, [scale.x]);
  const yTicks = useMemo(() => {
    return (
      //@ts-ignore
      scale.y
        //@ts-ignore
        .ticks(yNumTicks)
        .map((value: any) => {
          return {
            value,
            //@ts-ignore
            formattedValue: scale.y.tickFormat()(value),
            yOffset: scale.y(value),
          };
        })
    );
  }, [scale.y]);

  // ---------- JSX ----------
  return (
    <g className={styles.axes}>
      <g className={styles.yAxis}>
        {/* Y AXIS LINE */}
        {yAxisLineVisible && (
          <path
            className={styles.axis}
            d={[
              "M",
              -yTickSize,
              0,
              "H",
              0,
              "v",
              dim.height,
              "H",
              xTickSize,
            ].join(" ")}
          />
        )}

        {/* Y AXIS TICKS */}
        {yTicks.map(({ value, formattedValue, yOffset }: TickProps) => (
          <g key={`y-tick-${value}`} transform={`translate(0,${yOffset})`}>
            <line x2={-yTickSize} stroke="currentColor" />
            {yLabelsVisible && (
              <text
                style={{
                  fontSize: largerFont || undefined,
                  transform: `translateX(${yPadding}px)`,
                }}
                className={classNames(styles.label, {
                  [styles.largeFont]: largerFont,
                })}
                dominantBaseline="middle"
              >
                {formattedValue}
              </text>
            )}
          </g>
        ))}

        {/* Y AXIS GRIDLINES */}
        {yGridlinesVisible &&
          yTicks.map(({ value, yOffset }: TickProps) => (
            <g
              key={`y-gridline-${value}`}
              transform={`translate(0,${yOffset})`}
            >
              <line x2={dim.width} className={styles.gridline} />
            </g>
          ))}

        {/* ADD'L TOP BOUNDARY LINE */}
        {topBoundaryVisible && (
          <g>
            <line
              x2={dim.width}
              className={classNames(styles.gridline, styles.boundaryLine)}
            />
          </g>
        )}
      </g>

      <g className={styles.xAxis} transform={`translate(0, ${dim.height})`}>
        {/* X AXIS LINE */}
        {xAxisLineVisible && (
          <path
            className={styles.axis}
            d={[
              "M",
              0,
              xTickSize,
              "v",
              -xTickSize,
              "H",
              dim.width,
              "v",
              xTickSize,
            ].join(" ")}
          />
        )}

        {/* X AXIS TICKS */}
        {xTicks.map(({ value, formattedValue, xOffset }: TickProps) => (
          <g key={`x-tick-${value}`} transform={`translate(${xOffset}, 0)`}>
            <line y2={xTickSize} stroke="currentColor" />
            {xLabelsVisible && (
              <text
                className={classNames(styles.label, {
                  [styles.largeFont]: largerFont,
                })}
                style={{
                  fontSize: largerFont || undefined,
                  transform: `translateY(${xPadding}px)`,
                }}
              >
                {formattedValue}
              </text>
            )}
          </g>
        ))}

        {/* X AXIS GRIDLINES */}
        {xGridlinesVisible &&
          xTicks.map(({ value, xOffset }: TickProps) => (
            <g
              key={`x-gridline-${value}`}
              transform={`translate(${xOffset},0)`}
            >
              <line y2={-dim.height} className={styles.gridline} />
            </g>
          ))}

        {/* ADD'L RIGHT BOUNDARY LINE */}
        {rightBoundaryVisible && (
          <g transform={`translate(${dim.width},0)`}>
            <line
              y2={-dim.height}
              className={classNames(styles.gridline, styles.boundaryLine)}
            />
          </g>
        )}
      </g>
    </g>
  );
};
export default Axes;
