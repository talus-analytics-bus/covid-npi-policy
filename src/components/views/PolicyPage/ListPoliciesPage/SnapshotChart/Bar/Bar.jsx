import React from "react";

import PolicyCategoryIcon from "../../../PolicyCategoryIcon/PolicyCategoryIcon.js";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import styles from "./Bar.module.scss";

const Bar = ({ category, bar, index, dim }) => {
  return (
    <g
      key={category}
      id={category}
      style={{ transform: `translateY(${dim.axes.y.scale(index)}px)` }}
    >
      <path
        className={styles.barPath}
        key="activeExpired"
        style={{ fill: "#409384" }}
        d={`M ${dim.axes.x.scale(0)}, 0
         L ${dim.axes.x.scale(bar.active + bar.expired || 0)}, 0
         L ${dim.axes.x.scale(bar.active + bar.expired || 0)}, ${dim.barWidth}
         L ${dim.axes.x.scale(0)}, ${dim.barWidth}
        `}
      />
      <path
        className={styles.barPath}
        key="active"
        style={{ fill: "#96C4BB" }}
        d={`M ${dim.axes.x.scale(0)}, 0
         L ${dim.axes.x.scale(bar.active || 0)}, 0
         L ${dim.axes.x.scale(bar.active || 0)}, ${dim.barWidth}
         L ${dim.axes.x.scale(0)}, ${dim.barWidth}
        `}
      />
      <path
        className={styles.barPath}
        key="enacted"
        style={{ fill: "#E55E37" }}
        d={`M ${dim.axes.x.scale(0)}, 0
         L ${dim.axes.x.scale(bar.enacted || 0)}, 0
         L ${dim.axes.x.scale(bar.enacted || 0)}, ${dim.barWidth}
         L ${dim.axes.x.scale(0)}, ${dim.barWidth}
        `}
      />
      <foreignObject
        x={dim.axes.x.scale(0) - dim.padding.axis - 15}
        y={0}
        width={dim.barWidth}
        height={dim.barWidth}
      >
        <Tippy content={category} theme={"light"} placement={"bottom"}>
          <div className={styles.iconHolder}>
            <PolicyCategoryIcon category={category} />
          </div>
        </Tippy>
      </foreignObject>
    </g>
  );
};

export default Bar;
