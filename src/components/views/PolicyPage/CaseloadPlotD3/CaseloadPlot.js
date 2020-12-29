import React from "react";
import { scaleTime, scaleLinear, line } from "d3";

import Axes from "./Axes/Axes";

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
  const { caseload } = props;

  // layout constants
  const [constDim, setConstDim] = React.useState({
    width: 800,
    height: 150,

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

  dim.xLabelHeight = dim.xLabelFontSize;

  dim.yAxis = {
    height:
      dim.height -
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
      {/* /> */}
      <Axes dim={dim} scale={scale} />
      <g className={styles.dailyLines}>
        {caseload &&
          scale &&
          caseload.map(day => (
            <line
              style={inlineStyles.dailyLines}
              key={day.date}
              x1={scale.x(day.date)}
              y1={dim.origin.y}
              x2={scale.x(day.date)}
              y2={scale.y(day.value)}
            />
          ))}
      </g>
      <path d={averageLinePath} className={styles.averageLine} />
    </svg>
  );
};

export default CaseloadPlot;
