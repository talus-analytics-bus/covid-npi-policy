import React from "react";

import PolicyCategoryIcon from "../../../PolicyCategoryIcon/PolicyCategoryIcon.js";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import styles from "./Bar.module.scss";

const Bar = ({ category, bar, index, dim }) => {
  return (
    <g style={{ transform: `translateX(${dim.axes.x.scale(index)}px)` }}>
      <path
        className={styles.barPath}
        key="activeExpired"
        style={{ fill: "#409384" }}
        d={`M 0,${dim.axes.y.scale(0)}
         L 0,${dim.axes.y.scale(bar.active + bar.expired || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(bar.active + bar.expired || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(0)}
        `}
      />
      <path
        className={styles.barPath}
        key="active"
        style={{ fill: "#96C4BB" }}
        d={`M 0,${dim.axes.y.scale(0)}
         L 0,${dim.axes.y.scale(bar.active || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(bar.active || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(0)}
        `}
      />
      <path
        className={styles.barPath}
        key="enacted"
        style={{ fill: "#E55E37" }}
        d={`M 0,${dim.axes.y.scale(0)}
         L 0,${dim.axes.y.scale(bar.enacted || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(bar.enacted || 0)}
         L ${dim.barWidth}, ${dim.axes.y.scale(0)}
        `}
      />
      <foreignObject
        x={0}
        y={dim.axes.y.scale(0) + dim.padding.axis}
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
