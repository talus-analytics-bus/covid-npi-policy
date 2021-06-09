import React, { useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const sliderStrokeWidth = 3;

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
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
  const [dragging, setDragging] = useState();
  const [sliderX, setSliderX] = useState(0);
  const [sliderDate, setSliderDate] = useState(scale.x.invert(0));
  const [dragStartX, setDragStartX] = useState(0);

  const handleDragStart = e => {
    // prevent the text from highlighting
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    setDragStartX(xPos - sliderX);
  };
  const handleDrag = e => {
    if (dragging) {
      const CTM = svgElement.current.getScreenCTM();
      const xPos = (e.clientX - CTM.e) / CTM.a;
      setSliderX(xPos - dragStartX);
      const sliderDate = scale.x.invert(xPos - dragStartX + dim.xAxis.start.x);
      setSliderDate(sliderDate);
    }
  };

  const handleDragEnd = e => {
    setDragging(false);
    setDragStartX(0);
  };

  const highlightPolicies =
    policiesByDate &&
    sliderDate &&
    policiesByDate[sliderDate.toISOString().substring(0, 10)];

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
          transform: `translateX(${sliderX - sliderStrokeWidth / 4}px)`,
        }}
      >
        <path
          style={{
            strokeWidth: sliderStrokeWidth,
            stroke: "rgba(2, 63, 136, 1)",
          }}
          d={`M ${dim.xAxis.start.x},${dim.yAxis.start.y} 
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
          {formatDate(sliderDate)}
        </text>
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
          transform: `translateX(${sliderX - sliderStrokeWidth / 4}px)`,
        }}
        cx={dim.xAxis.start.x}
        cy={(dim.yAxis.end.y - dim.yAxis.start.y) * 0.25}
        r={6}
      />
    </g>
  );
};

export default Slider;
