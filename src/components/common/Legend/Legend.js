// standard packages
import React from "react";

// 3rd party packages
import classNames from "classnames";
import moment from "moment";

// local components
import { InfoTooltip } from "../../common";

// utilities
import Util, { percentize, isLightColor } from "../../misc/Util.js";

// assets and styles
import styles from "./legend.module.scss";
import varsExports from "../../../assets/styles/vars.module.scss";
import { getEvenSteps } from "src/components/misc/UtilsTyped";

/**
 * @method Legend
 */
const Legend = ({ ...props }) => {
  // get metric info and legend info with which to create legend entry
  const definition = props.metric_definition;
  const display_name = props.metric_displayname || definition;

  // type: currently continuous is supported
  // TODO categorical
  // TODO icon_list
  // TODO icon_scale
  const type = props.type;
  const colorscale = props.colorscale;
  const entryName = display_name;

  // generate legend JSX based on type of legend needed
  const getLegendJsx = ({ type, element }) => {
    const typeAndElement = type + " - " + element;
    if (typeAndElement === "continuous - bubble") {
      const range = colorscale.range();
      const labels = Object.values(props.labels.bubble);
      const radii = getEvenSteps(10, 30, 4);
      const { noDataGray } = varsExports;
      const noData = (
        <div className={styles.entry}>
          <div
            className={classNames(styles.circle)}
            style={{
              backgroundColor: noDataGray,
              height: radii[0],
              width: radii[0],
              transformOrigin: "center",
              marginBottom: 10,
            }}
          ></div>
          <div className={styles.labels}>
            {[
              <div style={{ lineHeight: 1.1 }}>
                Data not
                <br />
                available
              </div>,
            ].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
        </div>
      );

      const zero = (
        <div className={styles.entry}>
          <div
            className={classNames(styles.circle)}
            style={{
              backgroundColor: "transparent",
              border: "2px solid " + varsExports.zeroGray,
              height: radii[0],
              width: radii[0],
              marginBottom: 10,
            }}
          ></div>
          <div className={styles.labels}>
            {["Zero"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
        </div>
      );

      return (
        <div className={styles.content}>
          {noData}
          {zero}
          <div className={styles.entry}>
            <div className={styles.shapeSeries}>
              {radii.map(d => (
                <div
                  key={d}
                  className={styles.circle}
                  style={{
                    backgroundColor: range[1],
                    height: d,
                    width: d,
                    border:
                      props.outline !== undefined
                        ? `2px solid ${props.outline}`
                        : undefined,
                  }}
                />
              ))}
            </div>
            <div className={styles.labels}>
              {labels.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (typeAndElement === "continuous - basemap") {
      const range = colorscale.range();
      const labels = Object.values(props.legend.labels.basemap);
      const noData = (
        <div className={styles.entry}>
          <div
            className={classNames(styles.rect, styles.hatched)}
            style={{
              backgroundColor: "#ccc",
            }}
          ></div>
          <div className={styles.labels}>
            {["No data"].map(d => (
              <div>{d}</div>
            ))}
          </div>
        </div>
      );
      const { noDataGray } = varsExports;
      const zero = (
        <div className={styles.entry}>
          <div
            className={styles.rect}
            style={{
              backgroundColor: noDataGray,
              border: `1px solid ${noDataGray}`,
            }}
          ></div>
          <div className={styles.labels}>
            {["Zero"].map(d => (
              <div>{d}</div>
            ))}
          </div>
        </div>
      );
      return (
        <div className={styles.content}>
          {noData}
          {zero}
          <div className={styles.entry}>
            <div className={styles.symbols}>
              <div
                className={styles.gradientBar}
                style={{
                  background: `linear-gradient(90deg, ${range[0]} 0%, ${range[1]} 100%)`,
                }}
              ></div>
            </div>
            <div className={styles.labels}>
              {labels.map(d => (
                <div>{d}</div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (typeAndElement === "ordinal - basemap") {
      const range = colorscale.range();
      const labels = Object.values(props.legend.labels.basemap);
      const noData = (
        <div className={styles.entry}>
          <div
            className={classNames(styles.rect, styles.hatched)}
            style={{
              backgroundColor: "#ccc",
            }}
          ></div>
          <div className={styles.labels}>
            {["No data"].map(d => (
              <div>{d}</div>
            ))}
          </div>
        </div>
      );

      // prep style entries
      const styleEntries = range.map(d => {
        if (d.startsWith("#"))
          return {
            backgroundColor: d,
          };
        else {
          return {
            "background-image": `url("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png")`,
          };
        }
      });
      return (
        <div className={styles.content}>
          {noData}
          <div className={styles.entry}>
            <div className={styles.symbols}>
              {styleEntries.map(d => (
                <div
                  className={classNames(styles.rect, styles.skinny)}
                  style={d}
                />
              ))}
            </div>
            <div className={styles.labels}>
              {labels.map(d => (
                <div>{d}</div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (typeAndElement.startsWith("quantized")) {
      const range =
        props.range !== undefined ? props.range : colorscale.range();
      const domain =
        props.domain !== undefined ? props.domain : colorscale.domain();
      const borders = props.borders !== undefined ? props.borders : null;
      // TODO allow non-pct labels
      const labelsInside = props.labelsInside === true; // TODO dynamically as prop
      const labels = domain.map(d => {
        if (typeof d !== "number") return d;
        else if (d > 0) return "+" + percentize(d * 100);
        else return percentize(d * 100);
      });

      const subLabels = props.subLabels || null;
      // prep style entries
      const styleEntries = range.map((d, i) => {
        if (d !== undefined && !d.startsWith("data:image")) {
          return {
            width: props.width !== undefined ? props.width[i] : undefined,
            border: borders !== null ? borders[i] : undefined,
            backgroundColor: d,
            color: isLightColor(d) ? "#333" : "white",
          };
        } else {
          return {
            backgroundImage: `url("${d}")`,
            backgroundPosition: "center",
            padding: "3px 10px",
            border: "2px solid #BBDAF5",
          };
        }
      });

      return (
        <div className={styles.content}>
          <div className={styles.entry}>
            <div
              className={classNames(styles.quantized, {
                [styles.grid]: props.layout === "grid",
              })}
              style={{
                gridTemplateColumns:
                  props.gridTemplateColumns || `repeat(${range.length}, 1fr)`,
              }}
            >
              {styleEntries.map((d, i) => {
                const entryStyles =
                  props.entryStyles !== undefined
                    ? props.entryStyles[i] || {}
                    : {};
                const labelStyles =
                  props.labelStyles !== undefined
                    ? props.labelStyles[i] || {}
                    : {};
                const rectStyles =
                  entryStyles.rectStyles !== undefined
                    ? entryStyles.rectStyles
                    : {};
                return (
                  <div style={entryStyles} className={styles.rectGroup} key={i}>
                    <div
                      className={classNames(styles.rect, {
                        [styles.labelsInside]: labelsInside,
                      })}
                      style={{ ...d, ...rectStyles }}
                    >
                      {labelsInside && (
                        <div className={styles.label}>{labels[i]}</div>
                      )}
                    </div>
                    {!labelsInside && (
                      <div style={labelStyles} className={styles.label}>
                        {labels[i]}
                      </div>
                    )}
                    {subLabels && (
                      <span onClick={() => { }} className={styles.label}>
                        {subLabels[i]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  };
  const typeAndElement = type + "-" + props.for;
  let sectionHeader;
  if (props.trend) {
    const now = Util.formatDate(props.curDatetimeRange[1]);
    const then = Util.formatDate(
      moment(props.curDatetimeRange[1]).subtract(1, "days")
    );
    sectionHeader = props.trend
      ? `Change in ${Util.getInitLower(entryName)} from ${then} to ${now}`
      : entryName;
  } else {
    sectionHeader = (
      <div className={styles.nameAndTooltip}>
        {entryName}
        {definition && (
          <InfoTooltip
            place={"top"}
            id={typeAndElement}
            text={definition}
            setInfoTooltipContent={props.setInfoTooltipContent}
            wide={props.wideDefinition === true}
          />
        )}
      </div>
    );
  }
  return (
    <div
      className={classNames(styles.style, {
        [styles[props.className]]: props.className !== undefined,
      })}
    >
      <div className={styles.name}>{sectionHeader}</div>
      {getLegendJsx({ type, element: props.for })}
    </div>
  );
};
export default Legend;
