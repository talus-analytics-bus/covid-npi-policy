import React from "react";

import PolicyCategoryIcon from "../../../PolicyCategoryIcon/PolicyCategoryIcon.js";

import styles from "./Bar.module.scss";

const Bar = ({ category, bar, index, dim }) => {
  return (
    <g style={{ transform: `translateX(${dim.axes.x.scale(index)}px)` }}>
      <path
        style={{ fill: "#409384" }}
        d={`M 0,${dim.axes.y.scale(0)}
         L 0,${dim.axes.y.scale(bar.count + bar.active)}
         L ${dim.barWidth}, ${dim.axes.y.scale(bar.count + bar.active)}
         L ${dim.barWidth}, ${dim.axes.y.scale(0)}
        `}
      />
      <path
        style={{ fill: "#96C4BB" }}
        d={`M 0,${dim.axes.y.scale(0)}
         L 0,${dim.axes.y.scale(bar.count)}
         L ${dim.barWidth}, ${dim.axes.y.scale(bar.count)}
         L ${dim.barWidth}, ${dim.axes.y.scale(0)}
        `}
      />
      <foreignObject
        x={0}
        y={dim.axes.y.scale(0) + dim.padding.axis}
        width={dim.barWidth}
        height={dim.barWidth}
      >
        <div className={styles.iconHolder}>
          <PolicyCategoryIcon category={category} />
        </div>
      </foreignObject>
    </g>
  );
};

export default Bar;
