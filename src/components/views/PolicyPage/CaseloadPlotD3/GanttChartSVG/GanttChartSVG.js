import React from "react";
import PolicyBar from "./PolicyBar/PolicyBar";

const styles = {
  label: {
    fontSize: 10,
    textAnchor: "start",
    dominantBaseline: "hanging",
    fontFamily: "rawline",
    fill: "#436F79",
    fontStyle: "italic",
  },
};

const GanttChartSVG = ({ dim, scale, policiesForPlot, path }) => {
  const firstPolicy = policiesForPlot[0];

  console.log(firstPolicy);
  console.log(path);

  const subcategory = path[4];

  const titleLabel = `
  Other ${firstPolicy.auth_entity[0].place.level} 
  level ${subcategory} policies in 
  ${firstPolicy.auth_entity[0].place.loc}:`;

  return (
    <g id={"Gantt Chart"}>
      <text
        x={dim.xAxis.start.x}
        y={dim.gantt.top - dim.gantt.labelHeight}
        style={styles.label}
      >
        {titleLabel}
      </text>
      {scale &&
        policiesForPlot.map(policy => (
          <PolicyBar
            key={policy.policyID}
            path={path}
            {...{ dim, scale, policy }}
          />
        ))}
    </g>
  );
};

export default GanttChartSVG;
