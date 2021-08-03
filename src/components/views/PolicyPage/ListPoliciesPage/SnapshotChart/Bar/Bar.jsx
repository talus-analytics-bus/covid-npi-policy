import { Fragment, useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import PolicyCategoryIcon from "../../../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./Bar.module.scss";

const msPerDay = 86400000;

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const labelOrder = ["enacted", "active", "expired"];

const Bar = ({ category, bar, index, dim, selectedDate }) => {
  // I'm intentionally breaking / changing the react tree
  // here to avoid reconciliation in the tippy component
  // so that this bar component can render really fast
  // without having any composed components.

  // of course, this means it'll be a lot slower to
  // render the actual popup when someone hovers over
  // the bar, but that won't be noticeable and the
  // slowdown while moving the cursor definitely is.

  const [hovered, setHovered] = useState(false);

  const barJSX = (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      key={category}
      style={{ transform: `translateY(${dim.axes.y.scale(index)}px)` }}
    >
      <path
        className={styles.barPath}
        key="activeExpired"
        style={{ fill: "#96C4BB" }}
        d={`M ${dim.axes.x.scale(0)}, 0
   L ${dim.axes.x.scale((bar.active || 0) + (bar.expired || 0))}, 0
   L ${dim.axes.x.scale((bar.active || 0) + (bar.expired || 0))}, ${
          dim.barWidth
        }
   L ${dim.axes.x.scale(0)}, ${dim.barWidth}
  `}
      />
      <path
        className={styles.barPath}
        key="active"
        style={{ fill: "#409384" }}
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
    </g>
  );

  // this is the short-circuit for when the cursor is moving
  if (!hovered) return barJSX;
  // else render the tree with the popup normally
  else
    return (
      <Tippy
        content={
          <div className={styles.tooltip}>
            <h4>
              <PolicyCategoryIcon
                category={category}
                style={{ width: "1.5em", height: "1.5em", marginRight: ".5em" }}
              />
              {category}
            </h4>
            {console.log("tooltip content rendered")}
            <h5>{formatDate(new Date(selectedDate * msPerDay))}</h5>
            <div className={styles.policies}>
              {Object.entries(bar)
                .sort(
                  (a, b) => labelOrder.indexOf(a[0]) - labelOrder.indexOf(b[0])
                )
                .map(([name, count]) => (
                  <Fragment key={name}>
                    <span
                      className={styles.colorBlock}
                      style={{
                        background: {
                          enacted: "#E55E37",
                          active: "#409384",
                          expired: "#96C4BB",
                        }[name],
                      }}
                    />
                    <strong className={styles.number}>{count}</strong>
                    <span>
                      {name === "enacted"
                        ? "Newly enacted"
                        : name.charAt(0).toUpperCase() + name.slice(1)}{" "}
                      policies
                    </span>
                  </Fragment>
                ))}
            </div>
          </div>
        }
        theme={"light"}
      >
        {barJSX}
      </Tippy>
    );
};

export default Bar;
