import { useEffect, useState } from "react";
import * as d3 from "d3/dist/d3.min";
import { defineKeyVal } from "src/components/misc/Util";

import Bar from "./Bar/Bar";

import { useRecoilState } from "recoil";
import { introDateState } from "../PolicyEnvironmentPlot/Slider/Slider";


const SnapshotChart = ({ policySummaryObject, chartLabels }) => {
  const dim = {
    width: 255,
    height: 200,

    padding: {
      top: 4,
      bottom: 19,
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

  const [introDate, setIntroDate] = useRecoilState(introDateState);
  // const [introDate, setIntroDate] = useState();
  const [lastDate, setLastDate] = useState();

  useEffect(() => {
    if (policySummaryObject) {
      const dates = Object.keys(policySummaryObject);
      setIntroDate(dates[dates.length - 1]);
      setLastDate(dates[dates.length - 1]);
    }
  }, [policySummaryObject]);

  const byCategory = {};
  let selectedDate = introDate;
  if (lastDate && !policySummaryObject[introDate]) selectedDate = lastDate;

  if (policySummaryObject && policySummaryObject[selectedDate]) {
    // fill in all categories we need to have
    // pre-filling enacted, active, and expired here so we don't
    // have to have an if statement in a nested loop later
    chartLabels.forEach(label => {
      byCategory[label] = { enacted: 0, active: 0, expired: 0 };
    });

    // fill the counts based on the intro section date
    Object.entries(policySummaryObject[selectedDate]).forEach(
      ([status, categories]) => {
        Object.entries(categories).forEach(([category, policies]) => {
          defineKeyVal(byCategory, category, {})
          defineKeyVal(byCategory[category], status, 0)
          byCategory[category][status] += policies.size;
        });
      }
    );
  }

  const barCount = Object.keys(byCategory).length;

  // calculate the max for the last day of the chart
  const [maxBar, setMaxBar] = useState(0);
  useEffect(() => {
    console.count("policySummaryObject useEffect");
    const lastStatus =
      policySummaryObject &&
      Object.values(policySummaryObject)[
      Object.keys(policySummaryObject).length - 1
      ];

    if (lastStatus) {
      const maxObj = {};
      Object.entries(lastStatus).forEach(([status, categories]) => {
        Object.entries(categories).map(([category, policies]) => {
          if (!maxObj[category]) maxObj[category] = { [status]: policies.size };
          else if (!maxObj[category][status])
            maxObj[category][status] = policies.size;
          else maxObj[category][status] += policies.size;
        });
      });

      setMaxBar(
        Object.values(maxObj).reduce(
          (max, bar) => Math.max((bar.expired || 0) + (bar.active || 0), max),
          0
        )
      );
    }
  }, [policySummaryObject]);

  dim.axes.y.scale = d3
    .scaleLinear()
    .domain([0, barCount - 1])
    .range([dim.axes.y.start, dim.axes.y.end]);

  // just using the x scale here to get
  // evenly spaced bars between the padding
  dim.axes.x.scale = d3
    .scaleLinear()
    .domain([0, maxBar])
    .range([dim.axes.x.start, dim.axes.x.end]);

  const sortedBars = Object.entries(byCategory).sort(
    (a, b) => chartLabels.indexOf(b[0]) - chartLabels.indexOf(a[0])
  );

  return (
    <svg
      viewBox={`0 0 ${dim.width} ${dim.height}`}
      style={{
        overflow: "visible",
        // height: 400,
        // border: "1px solid black"
      }}
    >
      <path
        style={{ stroke: "#C4C4C4", strokeWidth: 0.5 }}
        d={`
        M ${dim.axes.x.start}, ${dim.axes.y.start + dim.barWidth + 2}
        L ${dim.axes.x.start}, ${dim.axes.y.end - 2}
        `}
      />
      {sortedBars.map(([category, bar], index) => (
        <Bar key={category} {...{ category, bar, index, dim, selectedDate }} />
      ))}
    </svg>
  );
};

export default SnapshotChart;
