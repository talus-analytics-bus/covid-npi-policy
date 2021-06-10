import React, { useEffect, useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const TooltipContent = ({ sliderDate, highlightPolicies }) => {
  const [renderPolicies, setRenderPolicies] = useState();

  // make sure not to empty out the popup when highlightPolicies
  // is undefined so that the closing animation is smooth
  useEffect(() => {
    if (highlightPolicies)
      setRenderPolicies(
        Object.entries(highlightPolicies).map(([category, policies]) => (
          <p>
            {category}: ({policies.length})
          </p>
        ))
      );
  }, [highlightPolicies]);

  return <div>{renderPolicies}</div>;
};

const Tooltip = ({ handleYPos, dim, sliderDate, highlightPolicies }) => {
  return (
    <foreignObject x={dim.xAxis.start.x} y={handleYPos} width={0} height={0}>
      <Tippy
        visible={Boolean(highlightPolicies)}
        content={<TooltipContent {...{ sliderDate, highlightPolicies }} />}
        placement={"right"}
      >
        <div />
      </Tippy>
    </foreignObject>
  );
};

export default Tooltip;
