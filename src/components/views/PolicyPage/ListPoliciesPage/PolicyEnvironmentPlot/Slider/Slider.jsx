import React, { useCallback, useEffect, useRef, useState } from "react";

import { atom, useRecoilState } from "recoil";

import Tooltip from "./Tooltip/Tooltip";

const msPerDay = 86400000;

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date.toDateString()).toLocaleString("en-de", {
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
  // const [introDate, setIntroDate] = useState();

  const [sliderX, setSliderX] = useState(dim.xAxis.end.x);
  const [dragStartX, setDragStartX] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);

  const sliderRef = useRef();

  const handleDragStart = e => {
    setPopupVisible(true);
    setCursorVisible(false);
    // prevent the text from highlighting
    e.stopPropagation();
    e.preventDefault();
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    setDragStartX(xPos - sliderX);
    document.body.addEventListener("mouseup", handleDragEnd);
  };

  const handleDrag = e => {
    if (dragStartX === 0 && !popupVisible) setCursorVisible(true);
    e.stopPropagation();
    e.preventDefault();
    const CTM = svgElement.current.getScreenCTM();
    const xPos = (e.clientX - CTM.e) / CTM.a;
    const newPos = xPos - dragStartX;

    if (newPos >= dim.xAxis.start.x && newPos <= dim.xAxis.end.x) {
      if (dragStartX !== 0) {
        setSliderX(newPos);
        const cursorDate = scale.x.invert(cursorX);
        setIntroDate(Math.floor(cursorDate.getTime() / msPerDay));
      }
      setCursorX(newPos + dragStartX);
      if (cursorVisible && !popupVisible) {
        const cursorDate = scale.x.invert(cursorX);
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
      const cursorDate = scale.x.invert(cursorX);
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
  const sliderDate = Math.floor(scale.x.invert(sliderX).getTime() / msPerDay);
  const cursorDate = Math.floor(scale.x.invert(cursorX).getTime() / msPerDay);

  const highlightPolicies =
    policySummaryObject && sliderDate && policySummaryObject[sliderDate];

  const cursorPolicies =
    policySummaryObject && cursorDate && policySummaryObject[cursorDate];

  const highlightCaseload =
    avgCaseLoadByDate &&
    sliderDate &&
    Math.round(
      avgCaseLoadByDate[
        new Date(sliderDate * msPerDay).toISOString().substring(0, 10)
      ]
    );

  const handleYPos = (dim.yAxis.end.y - dim.yAxis.start.y) * 0.3;

  // Arrow keys handling
  const handleKeys = e => {
    setCursorVisible(false);
    setPopupVisible(true);
    if (e.key === "ArrowLeft") {
      let nextDate;
      setSliderX(prev => {
        nextDate = new Date(scale.x.invert(prev));
        nextDate.setDate(nextDate.getDate() - 1);
        return scale.x(nextDate);
      });
      setIntroDate(Math.floor(nextDate.getTime() / msPerDay));
    }
    if (e.key === "ArrowRight") {
      let nextDate;
      setSliderX(prev => {
        nextDate = new Date(scale.x.invert(prev));
        nextDate.setDate(nextDate.getDate() + 1);
        return scale.x(nextDate);
      });
      setIntroDate(Math.floor(nextDate.getTime() / msPerDay));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeys);
    return () => {
      window.removeEventListener("keydown", handleKeys);
    };
  }, []);

  return (
    <g
      onClick={onClickChart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => {
        setCursorVisible(false);
        setIntroDate(sliderDate);
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
        // vertical line for the cursor
        <g
          style={{
            transform: `translateX(${cursorX - 0.5}px)`,
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
        </g>
      )}
      <g // Slider vertical line and date
        style={{
          transform: `translateX(${sliderX - 0.5}px)`,
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
              {formatDate(new Date(sliderDate * msPerDay))}
            </text>
          </>
        )}
        <Tooltip
          {...{
            handleYPos,
            sliderDate,
            setCursorVisible,
            highlightPolicies,
            highlightCaseload,
            popupVisible,
          }}
        />
      </g>
      {cursorVisible && ( // date and orange box for cursor
        <g
          style={{
            transform: `translateX(${cursorX - 0.5}px)`,
          }}
        >
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
            {formatDate(new Date(cursorDate * msPerDay))}
          </text>
        </g>
      )}
      {cursorVisible && // The cursor-highlighted policies
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
              cx={scale.x(new Date(cursorDate) * msPerDay)}
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
              cx={scale.x(new Date(sliderDate) * msPerDay)}
              cy={dim.yAxis.end.y - index * vSpacing - circlePadding}
              r={3}
            />
          ))}

      <g
        style={{
          transform: `translateX(${sliderX - 0.5}px)`,
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
          onClick={e => e.stopPropagation()}
          onMouseDown={handleDragStart}
          // onMouseEnter={() => setCursorVisible(false)}
          // onMouseLeave={() => setCursorVisible(true)}
        />
        <rect
          ref={sliderRef}
          onClick={e => e.stopPropagation()}
          onMouseDown={handleDragStart}
          // onMouseEnter={() => setCursorVisible(false)}
          // onMouseLeave={() => setCursorVisible(true)}
          x={-3}
          y={0}
          width={6}
          height={dim.yAxis.height + dim.paddingTop}
          style={{ fill: "rgba(0,0,0,0)", cursor: "pointer" }}
        />
      </g>
    </g>
  );
};

export default Slider;
