import React from "react";
import { Link, useLocation } from "react-router-dom";
import { scaleTime, scaleLinear, line } from "d3";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import Axes from "./Axes/Axes";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./CaseloadPlot.module.scss";

const rollingAverage = (series, windowSize) => {
  const padded = [...Array(windowSize).fill(0), ...series];
  return series.map((day, index) => {
    const w = padded.slice(index + 1, index + windowSize + 1);
    return w.reduce((acc, curr) => acc + curr, 0) / w.length;
  });
};

// simple function to add a svg text element to an svg,
// measure its dimensions, remove it, and return the bbox
const textBBox = ({ svg, string, font, fontSize }) => {
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

const CaseloadPlot = props => {
  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  console.log([iso3, state]);

  const policyContextConsumer = React.useContext(policyContext);

  const { caseload } = policyContextConsumer;

  // layout constants
  const [constDim, setConstDim] = React.useState({
    width: 800,
    caseloadHeight: 150,

    gantt: {
      // height will be calculated
      // if the gantt chart is being shown
      height: 0,
      barHeight: 5,
      barGap: 1.5,
      paddingTop: 5,
    },

    paddingTop: 5,
    paddingRight: 2,
    paddingLeft: 0,
    paddingBottom: 5,

    // yLabelWidth will be changed
    // once it is calculated based
    // on the actual labels to be
    // rendered.
    yLabelWidth: 20,
    yLabelPadding: 5,
    yLabelFontSize: 8,

    xLabelFontSize: 8,
    xLabelPadding: 5,
  });

  // calculate derived layout dimensions
  // and reference points
  const dim = { ...constDim };

  let policiesForPlot = [];
  if (props.simultaneousPolicies) {
    // create gantt chart rows; goal is to pack
    // them in as much as possible.

    // put policies in a sorted array starting with earliest
    const policyArr = Object.entries(props.simultaneousPolicies).map(
      ([policyID, policy]) => ({
        ...policy,
        policyID: policyID,
        date_start_effective: new Date(policy.date_start_effective),
        date_end_actual: policy.date_end_actual
          ? new Date(policy.date_end_actual)
          : "active",
      })
    );

    const sortedPolicies = policyArr.sort(
      (a, b) => a.date_start_effective - b.date_start_effective
    );

    console.log(sortedPolicies);

    // build an array of rows to keep track of when
    // any bar in that row ends
    const rows = [new Date(0)];

    // iterate over the policies and register their
    // end dates in the earliest row where they fit
    sortedPolicies.forEach(policy => {
      console.log(`find row for ${policy.id}`);

      let index = 0;
      for (const endDate of rows) {
        // console.log(rows);
        // console.log(`check row ${index}`);
        // check if it fits in existing rows
        // if the end is 'active' then the row is full
        if (endDate !== "active" && endDate < policy.date_start_effective) {
          // console.log(`put policy in row ${index}`);
          // set the new end date of this row
          rows[index] = policy.date_end_actual;
          // add the policy to the array for plotting
          policiesForPlot.push({ ...policy, rowNumber: index });
          break;
        }

        // if it doesn't fit in any of the rows
        if (index === rows.length - 1) {
          // console.log("add row");
          // console.log(`put policy in row ${index + 1}`);
          // add new row, with new end date
          rows.push(policy.date_end_actual);
          // add the policy to the array for plotting
          policiesForPlot.push({ ...policy, rowNumber: index + 1 });
          break;
        }

        index++;
      }
    });

    dim.gantt = {
      ...dim.gantt,
      height:
        rows.length * (dim.gantt.barHeight + dim.gantt.barGap) +
        dim.gantt.paddingTop,
      paddingTop: 10,
    };
  }

  dim.height = dim.caseloadHeight + dim.gantt.height;

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

  dim.gantt.top = dim.xAxis.start.y + dim.xLabelHeight + dim.gantt.paddingTop;

  // make sure the gap between lines is always 40% of the line
  // width, to adjust for plots with different numbers of days
  const inlineStyles = {
    dailyLines: {
      strokeWidth: caseload ? (dim.xAxis.length / caseload.length) * 0.6 : 1.5,
    },
  };

  const caseloadMax = React.useMemo(
    () => caseload && Math.max(...caseload.map(day => day.value)),
    [caseload]
  );

  const scale = React.useMemo(
    () =>
      caseloadMax && {
        x: scaleTime()
          .domain([caseload[0].date, caseload.slice(-1)[0].date])
          .range([dim.xAxis.start.x, dim.xAxis.end.x]),
        y: scaleLinear()
          .domain([0, caseloadMax])
          .range([dim.yAxis.end.y, dim.yAxis.start.y]),
      },
    [caseload, caseloadMax, dim.yAxis, dim.xAxis]
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

  return (
    <svg
      viewBox={`0 0 ${dim.width} ${dim.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
      ref={svgElement}
    >
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
      <Axes dim={dim} scale={scale} />
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
      {props.simultaneousPolicies && scale && (
        <g className={styles.gantt}>
          {policiesForPlot.map(policy => (
            <Tippy
              key={policy.policyID}
              content={<p>{policy.desc}</p>}
              maxWidth={"30rem"}
              theme={"light"}
              placement={"top"}
            >
              <Link
                to={{
                  pathname: `/policies/${iso3}/${state}/${policy.policyID.replace(
                    "ID",
                    ""
                  )}`,
                  state: {
                    path: [...props.path.slice(0, -1), policy.policyID],
                  },
                }}
              >
                <rect
                  x={scale.x(new Date(policy.date_start_effective))}
                  y={
                    dim.gantt.top +
                    policy.rowNumber * (dim.gantt.barHeight + dim.gantt.barGap)
                  }
                  width={
                    (policy.date_end_actual === "active"
                      ? dim.xAxis.end.x
                      : scale.x(policy.date_end_actual)) -
                    scale.x(policy.date_start_effective)
                  }
                  height={dim.gantt.barHeight}
                  fill={"#727272"}
                />
              </Link>
            </Tippy>
          ))}
          }
        </g>
      )}
      <path d={averageLinePath} className={styles.averageLine} />
    </svg>
  );
};

export default CaseloadPlot;
