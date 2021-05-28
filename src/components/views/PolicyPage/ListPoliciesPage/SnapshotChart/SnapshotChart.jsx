import React from "react";
import * as d3 from "d3/dist/d3.min";

import Bar from "./Bar/Bar";

const SnapshotChart = ({ policySummaryObject }) => {
  const dim = {
    width: 200,
    height: 80,

    padding: {
      top: 5,
      bottom: 20,
      left: 5,
      right: 5,
      axis: 3,
    },

    barWidth: 15,
  };

  dim.axes = {
    x: {
      start: dim.padding.left,
      end: dim.width - dim.padding.right - dim.barWidth,
      length: dim.width - dim.barWidth - dim.padding.right - dim.padding.left,
    },
    y: {
      start: dim.height - dim.padding.bottom,
      end: dim.padding.top,
      length: dim.height - dim.padding.bottom - dim.padding.top,
    },
  };

  const barCount = Object.keys(policySummaryObject).length;

  const maxBar = Object.values(policySummaryObject).reduce(
    (max, bar) => Math.max(bar.count + bar.active, max),
    0
  );

  dim.axes.y.scale = d3
    .scaleLinear()
    .domain([0, maxBar])
    .range([dim.axes.y.start, dim.axes.y.end]);

  // just using the x scale here to get
  // evenly spaced bars between the padding
  dim.axes.x.scale = d3
    .scaleLinear()
    .domain([0, barCount - 1])
    .range([dim.axes.x.start, dim.axes.x.end]);

  window.dim = dim;

  return (
    <svg
      viewBox={`0 0 ${dim.width} ${dim.height}`}
      // style={{ border: "1px solid black" }}
    >
      {Object.entries(policySummaryObject)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([category, bar], index) => (
          <Bar key={category} {...{ category, bar, index, dim }} />
        ))}
      <path
        style={{ stroke: "#C4C4C4", strokeWidth: 0.5 }}
        d={`
        M ${dim.axes.x.start - 2}, ${dim.axes.y.start}
        L ${dim.axes.x.end + dim.barWidth + 2}, ${dim.axes.y.start}
        `}
      />
    </svg>
  );
};

export default SnapshotChart;
