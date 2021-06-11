import React, { useCallback, useEffect, useRef, useState } from "react";
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
  avgCaseLoadByDate,
}) => {
  const [sliderX, setSliderX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const sliderRef = useRef();

  const handleDragStart = e => {
    setPopupVisible(true);
    // prevent the text from highlighting
    e.stopPropagation();
    e.preventDefault();
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    setDragStartX(xPos - sliderX);
    document.body.addEventListener("mouseup", handleDragEnd);
  };

  const handleDrag = e => {
    if (dragStartX !== 0) {
      const CTM = svgElement.current.getScreenCTM();
      const xPos = (e.clientX - CTM.e) / CTM.a;
      const newPos = xPos - dragStartX;

      if (
        newPos + dim.xAxis.start.x >= dim.xAxis.start.x &&
        newPos + dim.xAxis.start.x <= dim.xAxis.end.x
      )
        setSliderX(newPos);
    }
  };

  const handleDragEnd = e => {
    setDragStartX(0);
    document.body.removeEventListener("mouseup", handleDragEnd);
  };

  const onClickBody = e => {
    if (e.target !== sliderRef.current) setPopupVisible(false);
  };

  const onScroll = useCallback(e => {
    setPopupVisible(false);
    window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.addEventListener("click", onClickBody);

    return function cleanup() {
      window.removeEventListener("scroll", onScroll, { passive: true });
      document.body.removeEventListener("click", onClickBody);
    };
  }, [onScroll]);

  useEffect(() => {
    if (popupVisible)
      window.addEventListener("scroll", onScroll, { passive: true });
  }, [popupVisible, onScroll]);

  // the +1 offset makes the slider visually align to the date
  const sliderDate = scale.x.invert(sliderX + dim.xAxis.start.x + 1);

  const highlightPolicies =
    policiesByDate &&
    sliderDate &&
    policiesByDate[sliderDate.toISOString().substring(0, 10)];

  const highlightCaseload =
    avgCaseLoadByDate &&
    sliderDate &&
    Math.round(avgCaseLoadByDate[sliderDate.toISOString().substring(0, 10)]);

  const handleYPos = (dim.yAxis.end.y - dim.yAxis.start.y) * 0.45;

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
        <Tooltip
          {...{
            handleYPos,
            dim,
            sliderDate,
            highlightPolicies,
            highlightCaseload,
            popupVisible,
          }}
        />
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
      <g
        style={{
          transform: `translateX(${sliderX}px)`,
        }}
      >
        <circle
          style={{
            fill: "rgba(2, 63, 136, 1)",
            stroke: "white",
            strokeWidth: "1",
          }}
          cx={dim.xAxis.start.x}
          cy={handleYPos}
          r={6}
        />
        <rect
          ref={sliderRef}
          onClick={e => e.stopPropagation()}
          onMouseDown={handleDragStart}
          x={dim.xAxis.start.x - 10}
          y={0}
          width={20}
          height={dim.yAxis.height + dim.paddingTop}
          style={{ fill: "rgba(0,0,0,0)" }}
        />
      </g>
    </g>
  );
};

export default Slider;
