/**
 * Tooltip for MapboxMap component.
 */
// standard packages
import React from "react"; // 3rd party packages

import classNames from "classnames"; // assets and styles

import styles from "./maptooltip.module.scss";

/**
 * Popup on map when a feature is clicked
 * @param {*} param0
 */

const MapTooltip = ({
  tooltipHeader,
  tooltipMainContent,
  actions = [],
  ...props
}) => {
  return (
    <div className={styles.mapTooltip}>
      {
        // Populate header title and subtitle if available
      }
      <TooltipHeader content={tooltipHeader} right={props.tooltipHeaderRight} />

      {
        // Populate tooltip main content, if available
      }
      {<TooltipBody content={tooltipMainContent} actions={actions} />}
    </div>
  );
};

export default MapTooltip;
/**
 * Header of map tooltip (i.e., popup)
 * @param {*} props
 */

function TooltipHeader(props) {
  if (props.content === null || props.content === undefined) return null;
  else
    return (
      <div className={styles.header}>
        <div className={styles.titles}>
          <div className={styles.title}>{props.content.title}</div>
          <div className={styles.subtitle}>{props.content.subtitle}</div>
        </div>
        {props.right !== null && props.right !== undefined && (
          <div className={styles.tooltipHeaderRight}>{props.right}</div>
        )}
      </div>
    );
}
/**
 * Main content of tooltip.
 * @param {*} props
 */

function TooltipBody(props) {
  if (props.content === null || props.content === undefined) return null;
  else
    return (
      <div className={styles.content}>
        {props.content.length === 0 && (
          <div>
            <i>No data to show</i>
          </div>
        )}
        {<TooltipBodyEntries content={props.content} />}
        {<TooltipBodyActions content={props.actions} />}
      </div>
    );
}
/**
 * List of entries of tooltip content
 * @param {*} props
 */

function TooltipBodyEntries(props) {
  return props.content.map(d => <TooltipBodyEntry content={d} />);
}
/**
 * Actions (buttons) available to click at bottom of popup.
 * @param {*} props
 */

function TooltipBodyActions(props) {
  return (
    props.content.length > 0 && (
      <div className={styles.actions}>{props.content}</div>
    )
  );
}

function TooltipBodyEntry(props) {
  return (
    <div
      className={classNames(styles.metric, styles[props.content.className])}
      key={props.content.label}
    >
      {props.content.customContent && props.content.customContent}
      {!props.content.customContent && (
        <React.Fragment>
          <div className={styles.metricHeader}>
            <div className={styles.label}>{props.content.label}</div>
          </div>
          <div className={styles.metricContent}>
            <div className={styles.value}>
              {props.content.value}&nbsp;
              <span className={styles.unit}>{props.content.unit}</span>
            </div>

            <TooltipTrendInfo content={props.content.trend}></TooltipTrendInfo>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
/**
 * Trends up, down, or same for metrics in tooltip
 * @param {*} props
 */

function TooltipTrendInfo(props) {
  if (props.content === null || props.content === undefined) return null;
  else
    return (
      <div
        className={classNames(
          styles.trend,
          ...props.content.classes.map(d => styles[d])
        )}
      >
        <div
          className={classNames(
            styles.sentiment,
            styles[props.content.noun.replace(" ", "-")]
          )}
        >
          {props.content.pct !== 0 && (
            <span>{props.content.pct_fmt}&nbsp;</span>
          )}
        </div>{" "}
        <div>
          {props.content.noun} {props.content.timeframe}
        </div>
      </div>
    );
}
