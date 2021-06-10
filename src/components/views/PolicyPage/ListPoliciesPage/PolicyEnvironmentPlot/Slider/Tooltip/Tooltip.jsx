import React, { useEffect, useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const TooltipContent = ({
  sliderDate,
  highlightPolicies,
  highlightCaseload,
}) => (
  <div style={{ pointerEvents: "auto" }}>
    <p>{highlightCaseload} new cases</p>
    {highlightPolicies &&
      Object.entries(highlightPolicies).map(([category, policies]) => (
        <p key={category}>
          <a href="/policymaps">
            {category}: ({policies.length})
          </a>
        </p>
      ))}
  </div>
);

const Tooltip = ({
  handleYPos,
  dim,
  sliderDate,
  highlightPolicies,
  highlightCaseload,
  popupVisible,
}) => {
  return (
    <foreignObject x={dim.xAxis.start.x} y={handleYPos} width={0} height={0}>
      <Tippy
        visible={popupVisible}
        content={
          <TooltipContent
            {...{ sliderDate, highlightPolicies, highlightCaseload }}
          />
        }
        placement={"right"}
        theme={"light"}
      >
        <div />
      </Tippy>
    </foreignObject>
  );
};

export default Tooltip;
