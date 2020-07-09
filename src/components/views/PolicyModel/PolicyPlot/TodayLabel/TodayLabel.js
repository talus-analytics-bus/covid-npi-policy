import React from 'react'

const TodayLabel = props => {
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
        fill="#7FC6FA"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Raleway"
        fontWeight="700"
      >
        {props.text}
      </text>
      <path
        d={`M ${props.x} 8 L ${props.x} ${100}`}
        stroke="#7FC6FA"
        strokeWidth="1.5"
      />
    </g>
  )
}

export default TodayLabel
