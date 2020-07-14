import React from "react";

const LineExtension = props => {
  return (
    <g>
      {/* <rect */}
      {/*   x={props.x - (props.text.length * 5.5) / 2} */}
      {/*   y="0" */}
      {/*   width={props.text.length * 5.5} */}
      {/*   height="20" */}
      {/*   fill="white" */}
      {/*   stroke="#29ABE2" */}
      {/*   strokeWidth="1" */}
      {/*   rx={5} */}
      {/* /> */}
      <text
        x={props.x}
        y="5"
        fontSize="5"
        fill={props.color || "#7FC6FA"}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Raleway"
        fontWeight="700"
      >
        {props.text}
      </text>
      <path
        d={`M ${props.x} ${props.start || 8} L ${props.x} ${50}`}
        stroke={props.color || "#7FC6FA"}
        strokeWidth={props.strokeWidth || "1.5"}
      />
    </g>
  );
};

export default LineExtension;
