import React from "react";
import { Link, useLocation } from "react-router-dom";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import TooltipContent from "./TooltipContent/TooltipContent";

const PolicyBar = props => {
  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  const { dim, scale, policy } = props;

  const xPosition = scale.x(new Date(policy.date_start_effective));

  const yPosition =
    dim.gantt.top + policy.rowNumber * (dim.gantt.barHeight + dim.gantt.barGap);

  const width =
    (policy.date_end_actual === "active"
      ? dim.xAxis.end.x
      : scale.x(policy.date_end_actual)) - scale.x(policy.date_start_effective);

  const policyIDNumber = policy.policyID.replace("ID", "");

  const linkHref = `/policies/${iso3}/${state}/${policyIDNumber}`;
  const policyLinkPath = [...props.path.slice(0, -1), policy.policyID];

  return (
    <Tippy
      key={policy.policyID}
      content={<TooltipContent {...{ policy }} />}
      maxWidth={"30rem"}
      theme={"light"}
      placement={"top"}
    >
      <Link
        to={{
          pathname: linkHref,
          state: { path: policyLinkPath },
        }}
      >
        <rect
          x={xPosition}
          y={yPosition}
          width={width}
          height={dim.gantt.barHeight}
          fill={"#727272"}
        />
      </Link>
    </Tippy>
  );
};

export default PolicyBar;
