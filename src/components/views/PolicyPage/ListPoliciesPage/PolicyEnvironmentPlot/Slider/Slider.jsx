import React, { useState } from "react";

const sliderStrokeWidth = 3;

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
  const [sliderDate, setSliderDate] = useState();
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
        width={dim.width}
        height={dim.height}
        style={{ fill: "rgba(0,0,0,0)" }}
      />
      <path
        style={{
          strokeWidth: sliderStrokeWidth,
          stroke: "rgba(2, 63, 136, 1)",
          transform: `translateX(${sliderX - sliderStrokeWidth / 4}px)`,
        }}
        d={`M ${dim.xAxis.start.x},${dim.yAxis.start.y} 
        L ${dim.xAxis.start.x},${dim.yAxis.end.y}`}
      />

      {highlightPolicies &&
        Object.entries(highlightPolicies)
          .map(([category, policies]) => policies)
          .flat()
          .map((policies, index) => (
            <circle
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
