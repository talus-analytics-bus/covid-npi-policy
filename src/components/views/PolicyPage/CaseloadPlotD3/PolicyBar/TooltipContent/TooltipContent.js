import React from "react";

import styles from "./TooltipContent.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const TooltipContent = props => (
  <div className={styles.tooltipContent}>
    <header>
      <div>
        <h1>Effective From</h1>
        <h2> {formatDate(new Date(props.policy.date_start_effective))}</h2>
      </div>
      <div>
        <h1>Ended</h1>
        <h2>
          {props.policy.date_end_actual === "active"
            ? "Active"
            : formatDate(new Date(props.policy.date_end_actual))}
        </h2>
      </div>
    </header>
    <p>{props.policy.desc}</p>
  </div>
);

export default TooltipContent;
