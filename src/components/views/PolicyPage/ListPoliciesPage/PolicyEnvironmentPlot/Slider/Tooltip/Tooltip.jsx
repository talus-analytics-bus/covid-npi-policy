import React, { useEffect, useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const TooltipContent = ({
  sliderDate,
  highlightPolicies,
  highlightCaseload,
}) => {
  const [renderPolicies, setRenderPolicies] = useState();

  console.log(highlightCaseload);

  // make sure not to empty out the popup when highlightPolicies
  // is undefined so that the closing animation is smooth
  useEffect(() => {
    if (highlightPolicies)
      setRenderPolicies(
        <>
          <p>{highlightCaseload} new cases</p>
          {Object.entries(highlightPolicies).map(([category, policies]) => (
            <p key={category}>
              {category}: ({policies.length})
            </p>
          ))}
        </>
      );
  }, [highlightPolicies, highlightCaseload]);

  return <div>{renderPolicies}</div>;
};

const Tooltip = ({
  handleYPos,
  dim,
  sliderDate,
  highlightPolicies,
  highlightCaseload,
}) => {
  return (
    <foreignObject x={dim.xAxis.start.x} y={handleYPos} width={0} height={0}>
      <Tippy
        visible={Boolean(highlightPolicies)}
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
