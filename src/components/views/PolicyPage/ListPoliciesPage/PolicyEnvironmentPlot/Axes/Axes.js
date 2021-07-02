import React from "react";

// import styles from "./Axes.module.scss";
const formatNumber = number =>
  number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

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
        pointerEvents: "none",
      },
    },
    yAxis: {
      label: {
        fontSize: dim.yLabelFontSize,
        textAnchor: "end",
        dominantBaseline: "bottom",
        fontFamily: "rawline",
        fill: "rgba(130, 130, 130, 1)",
        pointerEvents: "none",
      },
      scaleLabel: {
        fontSize: dim.yLabelFontSize,
        textAnchor: "start",
        dominantBaseline: "bottom",
        fontFamily: "rawline",
        fill: "rgba(130, 130, 130, 1)",
        pointerEvents: "none",
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
                <>
                  <text
                    x={dim.yLabelWidth + dim.paddingLeft}
                    y={scale.y(tick) - 4}
                    style={styles.yAxis.label}
                  >
                    {formatNumber(tick)}
                    {/* {tick > 999 ? `${Math.round(tick / 1000)}k` : tick} */}
                  </text>
                  {index === 3 && (
                    <text
                      x={dim.xAxis.start.x}
                      y={scale.y(tick) - 4}
                      style={styles.yAxis.scaleLabel}
                    >
                      new daily cases
                    </text>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        {scale &&
          gridlines &&
          gridlines.map(tick => (
            <line
              key={tick}
              style={styles.yAxis.gridline}
              x1={0}
              y1={scale.y(tick)}
              x2={dim.width}
              y2={scale.y(tick)}
            />
          ))}
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
