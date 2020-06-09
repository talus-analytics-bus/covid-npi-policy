/**
 * Tooltip for MapboxMap component.
 */

// standard packages
import React from "react";

// 3rd party packages
import classNames from "classnames";

// assets and styles
import styles from "./maptooltip.module.scss";

// FUNCTION COMPONENT // ----------------------------------------------------//
const MapTooltip = ({
  tooltipHeader,
  tooltipMainContent,
  actions = [],
  ...props
}) => {
  const dHeader = props.tooltipHeaderMetric;
  return (
    <div className={styles.mapTooltip}>
      {
        // Populate header title and subtitle if available
      }
      {tooltipHeader && (
        <div className={styles.header}>
          <div className={styles.titles}>
            <div className={styles.title}>{tooltipHeader.title}</div>
            <div className={styles.subtitle}>{tooltipHeader.subtitle}</div>
          </div>
          {dHeader && (
            <div className={styles.metric}>
              <React.Fragment>
                {
                  //   <div className={styles.metricHeader}>
                  //   <div className={styles.label}>{dHeader.label}</div>
                  // </div>
                }

                <div className={styles.metricContent}>
                  <div className={styles.value}>
                    {dHeader.value}&nbsp;
                    <div className={styles.unit}>{dHeader.unit}</div>
                  </div>
                  {
                    // if trend information available, visualize it
                  }
                  {dHeader.trend && (
                    <div
                      className={classNames(
                        styles.trend,
                        ...dHeader.trend.classes.map(d => styles[d])
                      )}
                    >
                      <div
                        className={classNames(
                          styles.sentiment,
                          styles[dHeader.trend.noun.replace(" ", "-")]
                        )}
                      >
                        {dHeader.trend.pct !== 0 && (
                          <span>{dHeader.trend.pct_fmt}&nbsp;</span>
                        )}
                      </div>{" "}
                      <div>
                        {dHeader.trend.noun} {dHeader.trend.timeframe}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            </div>
          )}
        </div>
      )}
      {
        // Populate tooltip main content, if available
      }
      {tooltipMainContent && (
        <div className={styles.content}>
          {tooltipMainContent.length === 0 && (
            <div>
              <i>No data to show</i>
            </div>
          )}
          {tooltipMainContent.map(d => (
            <div
              className={classNames(styles.metric, styles[d.className])}
              key={d.label}
            >
              {d.customContent && d.customContent}
              {!d.customContent && (
                <React.Fragment>
                  <div className={styles.metricHeader}>
                    <div className={styles.label}>{d.label}</div>
                  </div>
                  <div className={styles.metricContent}>
                    <div className={styles.value}>
                      {d.value}&nbsp;
                      <span className={styles.unit}>{d.unit}</span>
                    </div>
                    {
                      // if trend information available, visualize it
                    }
                    {d.trend && (
                      <div
                        className={classNames(
                          styles.trend,
                          ...d.trend.classes.map(d => styles[d])
                        )}
                      >
                        <div
                          className={classNames(
                            styles.sentiment,
                            styles[d.trend.noun.replace(" ", "-")]
                          )}
                        >
                          {d.trend.pct !== 0 && (
                            <span>{d.trend.pct_fmt}&nbsp;</span>
                          )}
                        </div>{" "}
                        <div>
                          {d.trend.noun} {d.trend.timeframe}
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              )}
            </div>
          ))}
          {// actions, such as "view state", etc.
          actions.length > 0 && (
            <div className={styles.actions}>{actions.map(d => d)}</div>
          )}
        </div>
      )}
    </div>
  );
};
export default MapTooltip;
