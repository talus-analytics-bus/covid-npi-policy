import React, { useEffect, useState } from "react";
import { scaleTime, scaleLinear, line } from "d3";
import { useParams } from "react-router-dom";

import Legend from "./Legend/Legend";
import Axes from "./Axes/Axes";
import Slider from "./Slider/Slider";

import styles from "./PolicyEnvironmentPlot.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";
const msPerDay = 86400000;

const rollingAverage = (series, windowSize) => {
  const padded = [...Array(windowSize).fill(0), ...series];
  return series.map((day, index) => {
    const w = padded.slice(index + 1, index + windowSize + 1);
    return w.reduce((acc, curr) => acc + curr, 0) / w.length;
  });
};

// const checkSameDay = (date1, date2) =>
//   Math.floor(date1.getTime() / 86400000) ===
//   Math.floor(date2.getTime() / 86400000);

// simple function to add a svg text element to an svg,
// measure its dimensions, remove it, and return the bbox
export const textBBox = ({ svg, string, font, fontSize }) => {
  // namespace is required to create an SVG <text> node
  // instead of an HTML text node
  const svgNS = "http://www.w3.org/2000/svg";
  const svgText = document.createElementNS(svgNS, "text");
  svgText.style = `font-family: ${font}; font-size: ${fontSize}`;

  const textNode = document.createTextNode(string);
  svgText.appendChild(textNode);

  // adding it to the passed SVG means we can
  // inherit width and height settings, instead
  // of making an SVG from scratch
  svg.appendChild(svgText);

  const bbox = svgText.getBBox().width;

  // clean up the SVG
  svg.removeChild(svgText);

  return bbox;
};

const earliestDate = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return new Date(Math.min(new Date(a).getTime(), new Date(b).getTime()));
};

const PolicyEnvironmentPlot = () => {
  const policyContextConsumer = React.useContext(policyContext);

  const { caseload, status, policySummaryObject } = policyContextConsumer;

  const caseloadMax = React.useMemo(
    () => caseload && Math.max(...caseload.map(day => day.value)),
    [caseload]
  );

  const { iso3, state } = useParams();

  const [avgCaseLoadByDate, setAvgCaseloadByDate] = useState();

  useEffect(() => {
    if (caseload) {
      const rollingAverageValues = rollingAverage(
        caseload.map(day => day.value),
        7
      );

      const caseloadObj = {};
      caseload.forEach((day, index) => {
        caseloadObj[day.date.toISOString().substring(0, 10)] =
          rollingAverageValues[index];
      });
      setAvgCaseloadByDate(caseloadObj);
    }
  }, [caseload]);

  // layout
  const [constDim, setConstDim] = React.useState({
    width: 800,
    caseloadHeight: 180,

    paddingTop: 30,
    paddingRight: 52,
    paddingLeft: 0,
    paddingBottom: 0,

    // yLabelWidth will be changed
    // once it is calculated based
    // on the actual labels to be
    // rendered.
    yLabelWidth: 20,
    yLabelPadding: 5,
    yLabelFontSize: 10,

    xLabelFontSize: 11,
    xLabelPadding: 5,
  });

  // calculate derived layout dimensions
  // and reference points
  const dim = { ...constDim };

  dim.height = dim.caseloadHeight + dim.paddingBottom;

  dim.xLabelHeight = dim.xLabelFontSize + 5;

  dim.yAxis = {
    height:
      dim.caseloadHeight -
      dim.paddingTop -
      dim.paddingBottom -
      dim.xLabelHeight -
      dim.xLabelPadding,
  };

  dim.origin = {
    x: dim.paddingLeft + dim.yLabelWidth + dim.yLabelPadding,
    y: dim.yAxis.height + dim.paddingTop,
  };

  dim.yAxis.start = { x: dim.origin.x, y: dim.paddingTop };
  dim.yAxis.end = { x: dim.origin.x, y: dim.origin.y };

  dim.xAxis = {
    length:
      dim.width -
      dim.yLabelPadding -
      dim.yLabelWidth -
      dim.paddingLeft -
      dim.paddingRight,
  };

  dim.xAxis.start = { x: dim.origin.x, y: dim.origin.y };
  dim.xAxis.end = {
    x: dim.origin.x + dim.xAxis.length,
    y: dim.origin.y,
  };

  // make sure the gap between lines is always 40% of the line
  // width, to adjust for plots with different numbers of days
  const inlineStyles = {
    dailyLines: {
      strokeWidth: caseload ? (dim.xAxis.length / caseload.length) * 0.85 : 1.5,
    },
  };

  const scale = React.useMemo(
    () =>
      caseloadMax &&
      policySummaryObject && {
        x: scaleTime()
          .domain([
            earliestDate(
              caseload[0].date,
              Object.keys(policySummaryObject)[0] * msPerDay
            ),
            caseload.slice(-1)[0].date,
          ])
          .range([dim.xAxis.start.x, dim.xAxis.end.x]),
        y: scaleLinear()
          .domain([0, caseloadMax])
          .range([dim.yAxis.end.y, dim.yAxis.start.y]),
      },
    [caseload, caseloadMax, policySummaryObject, dim.yAxis, dim.xAxis]
  );

  const svgElement = React.useRef();

  // set the proper label width by measuring the length
  // of a string of zeros the same length as the highest
  // daily casload value in the SVG, and then removing
  // it before the render cycle.
  React.useEffect(() => {
    if (caseload && svgElement.current) {
      setConstDim(prev => ({
        ...prev,
        yLabelWidth: textBBox({
          svg: svgElement.current,
          string: String(caseloadMax).replace(/[0-9]/g, "0"),
          font: "rawline",
          fontSize: dim.yLabelFontSize,
        }),
      }));
    }
  }, [caseload, dim.yLabelFontSize, caseloadMax]);

  const averageLinePath = React.useMemo(() => {
    let averageLinePath;
    if (caseload && scale) {
      const rollingAverageValues = rollingAverage(
        caseload.map(day => day.value),
        7
      );

      const pathGenerator = line()
        .x(point => scale.x(point.date))
        .y(point => scale.y(point.value));

      const pointsArray = caseload.map((day, index) => ({
        date: day.date,
        value: rollingAverageValues[index],
      }));

      averageLinePath = pathGenerator(pointsArray);
    }

    return averageLinePath;
  }, [caseload, scale]);

  const maxDay = React.useMemo(
    () =>
      policySummaryObject &&
      Object.entries(policySummaryObject).reduce(
        (acc, [date, policies]) => {
          const count =
            policies.enacted &&
            Object.values(policies.enacted).reduce(
              (acc, cat) => [...cat].length + acc,
              0
            );
          return count > acc.count ? { date, count } : acc;
        },
        { date: 0, count: 0 }
      ),
    [policySummaryObject]
  );

  const circlePadding = 2;
  const vSpacing =
    maxDay && dim.yAxis.height / maxDay.count < 6.5
      ? dim.yAxis.height / maxDay.count
      : 6.5;

  // console.log(policiesByDate);

  return (
    <figure>
      <div className={styles.instructionSection}>
        <div>
          {status.caseload === "loaded" ? (
            <h2 className={styles.caseloadHeader}>
              Policy environment over time
            </h2>
          ) : (
            <h2 className={styles.caseloadHeader}>Loading COVID-19 Cases</h2>
          )}
          <p>
            *Text might need to be edited* Move the blue line to show the state
            and county policies that went into effect on each day and the 7-day
            average new cases. The bar chart below will show the policy
            breakdown on that day.
          </p>
        </div>
        <Legend />
      </div>
      {(status.caseload === "loading" || status.caseload === "loaded") && (
        <svg
          viewBox={`0 0 ${dim.width} ${dim.height}`}
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svg}
          ref={svgElement}
          style={{ overflow: "visible" }}
        >
          {/* <g className={styles.background}> */}
          {/* Visualize padding zone for testing */}
          {/* <rect */}
          {/*   x={dim.paddingLeft} */}
          {/*   y={dim.paddingTop} */}
          {/*   width={dim.width - dim.paddingLeft - dim.paddingRight} */}
          {/*   height={dim.height - dim.paddingTop - dim.paddingBottom} */}
          {/*   style={{ */}
          {/*     stroke: "grey", */}
          {/*     strokeWidth: 1, */}
          {/*     fill: "none", */}
          {/*   }} */}
          {/* /> */}
          {/* <rect */}
          {/*   x={0} */}
          {/*   y={0} */}
          {/*   width={dim.width} */}
          {/*   height={dim.height} */}
          {/*   style={{ */}
          {/*     stroke: "grey", */}
          {/*     strokeWidth: 1, */}
          {/*     fill: "none", */}
          {/*   }} */}
          {/* /> */}
          <g className={styles.dailyLines}>
            {caseload &&
              scale &&
              caseload.map(day => (
                <React.Fragment key={day.date}>
                  {day.value >= 0 && (
                    <line
                      style={inlineStyles.dailyLines}
                      x1={scale.x(day.date)}
                      y1={dim.origin.y}
                      x2={scale.x(day.date)}
                      y2={scale.y(day.value)}
                    />
                  )}
                </React.Fragment>
              ))}
          </g>
          <Axes
            dim={dim}
            scale={scale}
            policyHeight={vSpacing + circlePadding}
          />
          <path d={averageLinePath} className={styles.averageLine} />
          {/* </g> */}

          {scale &&
            policySummaryObject &&
            Object.entries(policySummaryObject)
              .map(([date, policies]) => {
                const rowDate = new Date(date * msPerDay);
                const xPos = scale.x(rowDate);
                let count = 0;

                return (
                  policies.enacted &&
                  Object.values(policies.enacted).map(category =>
                    [...category].map(_ => {
                      count = count + 1;
                      return (
                        <circle
                          key={count}
                          style={{
                            fill: "rgba(64, 147, 132, .5)",
                            // stroke: "white",
                            // strokeWidth: ".5",
                          }}
                          cx={xPos}
                          cy={
                            dim.yAxis.end.y -
                            (count - 1) * vSpacing -
                            circlePadding
                          }
                          r={3}
                        />
                      );
                    })
                  )
                );
              })
              .flat()}
          {scale && (
            <Slider
              {...{
                dim,
                svgElement,
                policySummaryObject,
                scale,
                vSpacing,
                circlePadding,
                avgCaseLoadByDate,
              }}
            />
          )}
        </svg>
      )}
      <figcaption className={styles.citation}>
        Caseload Source:{" "}
        {state === "national" ? (
          <a target="_blank" href="https://github.com/CSSEGISandData/COVID-19">
            COVID-19 Data Repository by the Center for Systems Science and
            Engineering (CSSE) at Johns Hopkins University
          </a>
        ) : (
          <a target="_blank" href="https://github.com/nytimes/covid-19-data">
            New York Times COVID-19 Data
          </a>
        )}
      </figcaption>
    </figure>
  );
};

export default PolicyEnvironmentPlot;
