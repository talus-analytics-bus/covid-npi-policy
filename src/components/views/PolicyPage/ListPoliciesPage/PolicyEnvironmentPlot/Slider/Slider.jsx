import React, { useCallback, useEffect, useRef, useState } from "react";

import { atom, useRecoilState } from "recoil";

import Tooltip from "./Tooltip/Tooltip";

const msPerDay = 86400000;

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const introDateState = atom({
  key: "introDate",
  default: 0,
});

const Slider = ({
  dim,
  svgElement,
  policySummaryObject,
  scale,
  vSpacing,
  circlePadding,
  avgCaseLoadByDate,
}) => {
  const [introDate, setIntroDate] = useRecoilState(introDateState);

  const [sliderX, setSliderX] = useState(dim.xAxis.end.x);
  const [dragStartX, setDragStartX] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);

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
    // setCursorVisible(true);
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    const newPos = xPos - dragStartX;

    if (newPos >= dim.xAxis.start.x && newPos <= dim.xAxis.end.x) {
      if (dragStartX !== 0) {
        setSliderX(newPos);
        const cursorDate = scale.x.invert(cursorX + 1);
        setIntroDate(Math.floor(cursorDate.getTime() / msPerDay));
      }

      setCursorX(newPos + dragStartX);

      if (cursorVisible && !popupVisible) {
        const cursorDate = scale.x.invert(cursorX + 1);
        setIntroDate(Math.floor(cursorDate.getTime() / msPerDay));
      }
    }
  };

  const handleDragEnd = e => {
    setDragStartX(0);
    document.body.removeEventListener("mouseup", handleDragEnd);
  };

  const onClickBody = e => {
    if (e.target !== sliderRef.current) setPopupVisible(false);
  };

  const onClickChart = e => {
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    const newPos = xPos;
    if (newPos >= dim.xAxis.start.x && newPos <= dim.xAxis.end.x) {
      setSliderX(newPos);
      setPopupVisible(true);
      const cursorDate = scale.x.invert(cursorX + 1);
      setIntroDate(Math.floor(cursorDate.getTime() / msPerDay));
    }
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
  const sliderDate = scale.x.invert(sliderX + 1);
  const cursorDate = scale.x.invert(cursorX + 1);

  const highlightPolicies =
    policySummaryObject &&
    sliderDate &&
    policySummaryObject[Math.floor(sliderDate.getTime() / msPerDay)];

  const cursorPolicies =
    policySummaryObject &&
    cursorDate &&
    policySummaryObject[Math.floor(cursorDate.getTime() / msPerDay)];

  const highlightCaseload =
    avgCaseLoadByDate &&
    sliderDate &&
    Math.round(avgCaseLoadByDate[sliderDate.toISOString().substring(0, 10)]);

  const handleYPos = (dim.yAxis.end.y - dim.yAxis.start.y) * 0.3;

  return (
    <g
      id="slider"
      onClick={onClickChart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => {
        setCursorVisible(false);
        const sliderDate = scale.x.invert(sliderX + 1);
        setIntroDate(Math.floor(sliderDate.getTime() / msPerDay));
      }}
      onMouseEnter={() => setCursorVisible(true)}
    >
      <rect
        // this rect is what sizes the group
        width={dim.width}
        height={dim.height}
        // doesn't work with fill='none'
        style={{ fill: "rgba(0,0,0,0)" }}
      />
      {cursorVisible && (
        <g
          style={{
            transform: `translateX(${cursorX}px)`,
          }}
        >
          <path
            style={{
              strokeWidth: 3,
              stroke: "rgba(2, 63, 136, .25)",
              // transform: `translateX(${cursorX}px)`,
              cursor: "pointer",
            }}
            d={`M ${0},${0} 
        L ${0},${dim.yAxis.end.y}`}
          />
          <rect
            x={-30}
            y={0}
            width={60}
            height={15}
            rx={3}
            style={{ fill: "rgb(229, 94, 55)" }}
          />
          <text
            x={0}
            y={3}
            style={{
              alignmentBaseline: "hanging",
              textAnchor: "middle",
              fill: "white",
              fontSize: 9,
            }}
          >
            {formatDate(cursorDate.toISOString().substring(0, 10))}
          </text>
        </g>
      )}
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
          d={`M ${0},${0} 
        L ${0},${dim.yAxis.end.y}`}
        />
        {!cursorVisible && !popupVisible && (
          <>
            <rect
              x={-30}
              y={0}
              width={60}
              height={15}
              rx={3}
              style={{ fill: "rgb(229, 94, 55)" }}
            />
            <text
              x={0}
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
          </>
        )}
        <Tooltip
          {...{
            handleYPos,
            dim,
            sliderDate,
            setCursorVisible,
            highlightPolicies,
            highlightCaseload,
            popupVisible,
          }}
        />
      </g>
      {cursorVisible &&
        cursorPolicies &&
        cursorPolicies.enacted &&
        Object.values(cursorPolicies.enacted)
          .map(category => [...category])
          .flat()
          .map((_, index) => (
            <circle
              key={index}
              style={{
                fill: "#e59f37",
                cursor: "pointer",
                // stroke: "white",
                // strokeWidth: ".5",
              }}
              cx={scale.x(new Date(cursorDate.toISOString().substring(0, 10)))}
              cy={dim.yAxis.end.y - index * vSpacing - circlePadding}
              r={3}
            />
          ))}
      {highlightPolicies &&
        highlightPolicies.enacted &&
        Object.values(highlightPolicies.enacted)
          .map(category => [...category])
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
          cx={0}
          cy={handleYPos}
          r={6}
        />
        <rect
          ref={sliderRef}
          onClick={e => e.stopPropagation()}
          onMouseDown={handleDragStart}
          x={-2}
          y={0}
          width={4}
          height={dim.yAxis.height + dim.paddingTop}
          onMouseEnter={() => setCursorVisible(false)}
          onMouseLeave={() => setCursorVisible(true)}
          style={{ fill: "rgba(0,0,0,0)", cursor: "pointer" }}
        />
      </g>
    </g>
  );
};

export default Slider;
