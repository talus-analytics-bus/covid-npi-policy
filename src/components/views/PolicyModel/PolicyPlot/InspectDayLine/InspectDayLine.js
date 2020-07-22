import React from "react";

import { LineSegment } from "victory";

const InspectDayLine = props => {
  const lineDate = new Date(props.datum.x);
  return (
    <LineSegment
      style={{ fill: lineDate > new Date() ? "#8D64DD" : "#333333" }}
    />
  );
};

export default InspectDayLine;
