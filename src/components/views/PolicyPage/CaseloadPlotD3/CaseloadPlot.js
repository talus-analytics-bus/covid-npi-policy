import React from "react";
import { scaleTime, scaleLinear, line } from "d3";

import styles from "./CaseloadPlot.module.scss";

const CaseloadPlot = props => {
  // set up dimensions and layout
  const [dim] = React.useState(() => {
    const dim = {};

    dim.width = 500;
    dim.height = 150;

    dim.paddingTop = 5;
    dim.paddingRight = 5;
    dim.paddingLeft = 5;
    dim.paddingBottom = 5;

    dim.yLabelWidth = 30;
    dim.yLabelPadding = 5;

    dim.xLabelHeight = 10;
    dim.xLabelPadding = 5;

    dim.yAxis = {
      height:
        dim.height -
        dim.paddingTop -
        dim.paddingBottom -
        dim.xLabelHeight -
        dim.xLabelPadding,
    };

    dim.origin = {
      x: dim.yLabelWidth + dim.yLabelPadding,
      y: dim.yAxis.height + dim.paddingTop,
    };

    dim.yAxis.start = { x: dim.origin.x, y: dim.paddingTop };
    dim.yAxis.end = { x: dim.origin.x, y: dim.origin.y };

    dim.xAxis = {
      length:
        dim.width - dim.yLabelPadding - dim.yLabelWidth - dim.paddingRight,
    };

    dim.xAxis.start = { x: dim.origin.x, y: dim.origin.y };
    dim.xAxis.end = {
      x: dim.origin.x + dim.xAxis.length,
      y: dim.origin.y,
    };

    return dim;
  });

  // set up scales
  const { caseload } = props;
  const [scale, setScale] = React.useState({ x: undefined, y: undefined });

  React.useEffect(() => {
    console.count("caseload useEffect");
    if (caseload)
      setScale({
        x: scaleTime()
          .domain([caseload[0].date, caseload.slice(-1)[0].date])
          .range([dim.xAxis.start.x, dim.xAxis.end.x]),
        y: scaleLinear()
          .domain([caseload[0].date, caseload.slice(-1)[0].date])
          .range([dim.yAxis.start.y, dim.yAxis.end.y]),
      });
  }, [caseload, dim.xAxis, dim.yAxis]);

  console.log("scales");
  console.log(scale);

  return (
    <svg
      viewBox={`0 0 ${dim.width} ${dim.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
    >
      <rect
        x={dim.paddingLeft}
        y={dim.paddingRight}
        width={dim.width - dim.paddingLeft - dim.paddingRight}
        height={dim.height - dim.paddingTop - dim.paddingBottom}
      />
      {/* Y-Axis */}
      <line
        x1={dim.yAxis.start.x}
        y1={dim.yAxis.start.y}
        x2={dim.yAxis.end.x}
        y2={dim.yAxis.end.y}
      />
      {/*X-Axis */}
      <line
        x1={dim.xAxis.start.x}
        y1={dim.xAxis.start.y}
        x2={dim.xAxis.end.x}
        y2={dim.xAxis.end.y}
      />
    </svg>
  );
};

export default CaseloadPlot;
