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
import { noDataGray } from "../../../assets/styles/vars.module.scss";

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
      const radii = [5, 10, 15, 20];
      const noData = (
        <div className={styles.entry}>
          <div
            className={classNames(styles.circle)}
            style={{
              backgroundColor: "#ccc",
              height: radii[radii.length - 1],
              width: radii[radii.length - 1],
              transform: "scale(0.5)",
              transformOrigin: "center",
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
              border: "6px solid #A4A4A4",
              height: radii[radii.length - 1],
              width: radii[radii.length - 1],
              transform: "scale(0.5)",
              // transformOrigin: "left center",
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
                      <a onClick={() => {}} className={styles.label}>
                        {subLabels[i]}
                      </a>
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
