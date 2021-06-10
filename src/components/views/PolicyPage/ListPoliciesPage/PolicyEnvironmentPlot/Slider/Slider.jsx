import React, { useState } from "react";
import Tooltip from "./Tooltip/Tooltip";

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Slider = ({
  dim,
  svgElement,
  policiesByDate,
  scale,
  vSpacing,
  circlePadding,
}) => {
  // const [dragging,setDragging] = useState();
  const [sliderX, setSliderX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  const handleDragStart = e => {
    // prevent the text from highlighting
    e.stopPropagation();
    e.preventDefault();
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    setDragStartX(xPos - sliderX);
  };

  const handleDrag = e => {
    if (dragStartX !== 0) {
      const CTM = svgElement.current.getScreenCTM();
      const xPos = (e.clientX - CTM.e) / CTM.a;
      setSliderX(xPos - dragStartX);
    }
  };

  const handleDragEnd = e => {
    setDragStartX(0);
  };

  // the +1 offset makes the slider visually align to the date
  const sliderDate = scale.x.invert(sliderX + dim.xAxis.start.x + 1);

  const highlightPolicies =
    policiesByDate &&
    sliderDate &&
    policiesByDate[sliderDate.toISOString().substring(0, 10)];

  const handleYPos = (dim.yAxis.end.y - dim.yAxis.start.y) * 0.4;

  return (
    <g id="slider" onMouseMove={handleDrag} onMouseUp={handleDragEnd}>
      <rect
        // this rect is what sizes the group
        width={dim.width}
        height={dim.height}
        // doesn't work with fill='none'
        style={{ fill: "rgba(0,0,0,0)" }}
      />
      <g
        style={{
          transform: `translateX(${sliderX}px)`,
        }}
      >
        <path
          style={{
            strokeWidth: 3,
            stroke: "rgba(2, 63, 136, 1)",
          }}
          d={`M ${dim.xAxis.start.x},${0} 
        L ${dim.xAxis.start.x},${dim.yAxis.end.y}`}
        />
        <rect
          x={dim.xAxis.start.x - 30}
          y={0}
          width={60}
          height={15}
          rx={3}
          style={{ fill: "rgb(229, 94, 55)" }}
        />
        <text
          x={dim.xAxis.start.x}
          y={3}
          style={{
            alignmentBaseline: "hanging",
            textAnchor: "middle",
            fill: "white",
            fontSize: 9,
          }}
        >
          {formatDate(sliderDate.toISOString().substring(0, 10))}
        </text>
        <Tooltip {...{ handleYPos, sliderDate, highlightPolicies }} />
      </g>

      {highlightPolicies &&
        Object.entries(highlightPolicies)
          .map(([category, policies]) => policies)
          .flat()
          .map((_, index) => (
            <circle
              key={index}
              style={{
                fill: "rgb(229, 94, 55)",
                // stroke: "white",
                // strokeWidth: ".5",
              }}
              cx={scale.x(new Date(sliderDate.toISOString().substring(0, 10)))}
              cy={dim.yAxis.end.y - index * vSpacing - circlePadding}
              r={3}
            />
          ))}
      <circle
        onMouseDown={handleDragStart}
        style={{
          fill: "rgba(2, 63, 136, 1)",
          stroke: "white",
          strokeWidth: "1",
          transform: `translateX(${sliderX}px)`,
        }}
        cx={dim.xAxis.start.x}
        cy={handleYPos}
        r={6}
      />
    </g>
  );
};

export default Slider;
