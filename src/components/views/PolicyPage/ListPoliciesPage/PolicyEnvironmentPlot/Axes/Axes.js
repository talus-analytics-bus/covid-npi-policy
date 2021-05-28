import React from "react";

// import styles from "./Axes.module.scss";

const Axes = props => {
  const { dim, scale } = props;

  const styles = {
    xAxis: {
      label: {
        fontSize: dim.xLabelFontSize,
        textAnchor: "middle",
        dominantBaseline: "hanging",
        fontFamily: "rawline",
        fill: "rgba(130, 130, 130, 1)",
      },
    },
    yAxis: {
      label: {
        fontSize: dim.yLabelFontSize,
        textAnchor: "end",
        dominantBaseline: "middle",
        fontFamily: "rawline",
        fill: "rgba(130, 130, 130, 1)",
      },
      gridline: {
        stroke: "lightgrey",
        strokeWidth: 0.8,
        strokeDasharray: 1,
      },
    },
  };

  const gridlines = React.useMemo(() => {
    if (scale) {
      const maxValue = scale.y.invert(dim.yAxis.start.y);
      const tickCount = 4;
      const sep = maxValue / tickCount;
      const power = Math.pow(10, Math.floor(Math.log10(sep * tickCount)));
      const roundedSep = Math.floor(sep / (power / 10)) * (power / 10);

      const steps = [];
      for (let i = 1; i <= 4; i++) steps.push(roundedSep * i);
      return steps;
    }
  }, [scale, dim.yAxis.start.y]);

  return (
    <g id="axes">
      <g id="y-axis">
        {gridlines &&
          gridlines.map((tick, index) => (
            <React.Fragment key={tick}>
              {index % 2 === 1 && (
                <text
                  x={dim.yLabelWidth + dim.paddingLeft}
                  y={scale.y(tick)}
                  style={styles.yAxis.label}
                >
                  {tick}
                  {/* {tick > 999 ? `${Math.round(tick / 1000)}k` : tick} */}
                </text>
              )}
            </React.Fragment>
          ))}
        {scale &&
          gridlines &&
          gridlines.map(tick => (
            <line
              key={tick}
              style={styles.yAxis.gridline}
              x1={dim.xAxis.start.x}
              y1={scale.y(tick)}
              x2={dim.xAxis.end.x}
              y2={scale.y(tick)}
            />
          ))}
        {/* <line */}
        {/*   x1={dim.yAxis.start.x} */}
        {/*   y1={dim.yAxis.start.y} */}
        {/*   x2={dim.yAxis.end.x} */}
        {/*   y2={dim.yAxis.end.y} */}
        {/* /> */}
      </g>
      <g id="x-axis">
        {scale &&
          scale.x.ticks(12).map(tick => (
            <text
              key={tick}
              x={scale.x(tick)}
              y={dim.origin.y + dim.xLabelPadding}
              style={styles.xAxis.label}
            >
              {tick.toLocaleString("default", {
                month: "short",
                timeZone: "UTC",
              })}
            </text>
          ))}
        {/* <line */}
        {/*   x1={dim.xAxis.start.x} */}
        {/*   y1={dim.xAxis.start.y} */}
        {/*   x2={dim.xAxis.end.x} */}
        {/*   y2={dim.xAxis.end.y} */}
        {/* /> */}
      </g>
    </g>
  );
};

export default Axes;
