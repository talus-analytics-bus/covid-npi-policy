import React from "react";

const styles = {
  newCases: {
    stroke: "#afb2b2",
    strokeWidth: 1.75,
    strokeLinecap: "round",
  },
  average: {
    stroke: "#436f79",
    strokeWidth: 2.5,
    strokeLinecap: "round",
  },
  label: {
    fontSize: 10,
    dominantBaseline: "middle",
    fontFamily: "rawline",
  },
};

const Legend = props => (
  <g transform={`translate(700, 1)`}>
    <line style={styles.newCases} x1={5} x2={5} y1={0} y2={8} />
    <text style={styles.label} x={18} y={5}>
      Daily New Cases
    </text>
    <line style={styles.average} x1={0} x2={10} y1={18} y2={18} />
    <text style={styles.label} x={18} y={20}>
      7-Day Average
    </text>
  </g>
);

export default Legend;
