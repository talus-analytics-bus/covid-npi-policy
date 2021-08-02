// import Tippy from "@tippyjs/react";
// import "tippy.js/dist/tippy.css";
// import "tippy.js/themes/light.css";

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
  // console.log("bar");
  return (
    // <Tippy
    //   content={
    //     <div className={styles.tooltip}>
    //       <h4>
    //         <PolicyCategoryIcon
    //           category={category}
    //           style={{ width: "1.5em", height: "1.5em", marginRight: ".5em" }}
    //         />
    //         {category}
    //       </h4>
    //       <h5>{formatDate(new Date(selectedDate * msPerDay))}</h5>
    //       <div className={styles.policies}>
    //         {Object.entries(bar)
    //           .sort(
    //             (a, b) => labelOrder.indexOf(a[0]) - labelOrder.indexOf(b[0])
    //           )
    //           .map(([name, count]) => (
    //             <React.Fragment key={name}>
    //               <span
    //                 className={styles.colorBlock}
    //                 style={{
    //                   background: {
    //                     enacted: "#E55E37",
    //                     active: "#409384",
    //                     expired: "#96C4BB",
    //                   }[name],
    //                 }}
    //               />
    //               <strong className={styles.number}>{count}</strong>
    //               <span>
    //                 {name === "enacted"
    //                   ? "Newly enacted"
    //                   : name.charAt(0).toUpperCase() + name.slice(1)}{" "}
    //                 policies
    //               </span>
    //             </React.Fragment>
    //           ))}
    //       </div>
    //     </div>
    //   }
    //   theme={"light"}
    // >
    <g
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
    // </Tippy>
  );
};

export default Bar;
