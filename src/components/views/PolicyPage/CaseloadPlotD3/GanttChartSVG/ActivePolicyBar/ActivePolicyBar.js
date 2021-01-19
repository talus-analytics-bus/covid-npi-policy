import React from "react";

const styles = {
  label: {
    fontSize: 10,
    textAnchor: "start",
    dominantBaseline: "auto",
    fontFamily: "rawline",
    fill: "#29334B",
    fontStyle: "italic",
  },
  issuedLine: {
    stroke: "#544F92",
  },
  inForceLine: {
    stroke: "#823831",
  },
  endLine: {
    stroke: "#812C27",
  },
};

const ActivePolicyBar = ({ dim, scale, activePolicy }) => {
  console.log(activePolicy);

  const textPad = 3;

  const dateIssuedPos = scale.x(new Date(activePolicy.date_issued));

  const startDatePos = scale.x(new Date(activePolicy.date_start_effective));
  const endDatePos = scale.x(new Date(activePolicy.date_end_actual));

  const barWidth = activePolicy.date_end_actual
    ? endDatePos - startDatePos
    : dim.xAxis.end.x;

  const labelsTop =
    dim.gantt.activePolicy.top + dim.gantt.activePolicy.barHeight;

  const labelHeight = dim.gantt.activePolicy.labelHeight;

  return (
    <g id="Active Policy">
      <rect
        x={startDatePos}
        y={dim.gantt.activePolicy.top}
        width={barWidth}
        height={dim.gantt.barHeight}
        fill={"#812C27"}
      />
      <text
        style={styles.label}
        x={dateIssuedPos + textPad}
        y={labelsTop + labelHeight * 3}
      >
        Policy Issued
      </text>
      <line
        style={styles.issuedLine}
        x1={dateIssuedPos}
        x2={dateIssuedPos}
        y1={dim.gantt.activePolicy.top}
        y2={labelsTop + labelHeight * 3}
      />
      <text
        style={styles.label}
        x={startDatePos + textPad}
        y={labelsTop + labelHeight * 2}
      >
        Policy In Force
      </text>
      <line
        style={styles.inForceLine}
        x1={startDatePos}
        x2={startDatePos}
        y1={dim.gantt.activePolicy.top}
        y2={labelsTop + labelHeight * 2}
      />
      {activePolicy.date_end_actual && (
        <>
          <text
            style={styles.label}
            x={endDatePos + textPad}
            y={labelsTop + labelHeight}
          >
            End of Policy
          </text>
          <line
            style={styles.endLine}
            x1={endDatePos}
            x2={endDatePos}
            y1={dim.gantt.activePolicy.top}
            y2={labelsTop + labelHeight}
          />
        </>
      )}
    </g>
  );
};

export default ActivePolicyBar;
