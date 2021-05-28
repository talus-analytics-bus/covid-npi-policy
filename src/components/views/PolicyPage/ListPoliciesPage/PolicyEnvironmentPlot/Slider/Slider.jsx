import React from "react";

const Slider = ({ dim }) => {
  return (
    <>
      <path
        style={{ strokeWidth: 3, stroke: "rgba(2, 63, 136, 1)" }}
        d={`M ${dim.xAxis.start.x},${dim.yAxis.start.y} 
        L ${dim.xAxis.start.x},${dim.yAxis.end.y}`}
      />
      <circle
        style={{
          fill: "rgba(2, 63, 136, 1)",
          stroke: "white",
          strokeWidth: "1",
        }}
        cx={dim.xAxis.start.x}
        cy={(dim.yAxis.end.y - dim.yAxis.start.y) * 0.25}
        r={6}
      />
    </>
  );
};

export default Slider;
