import React from "react";
import { VictoryPortal } from "victory";
import { getDisplayNameFromPolicyName } from "../PolicyPlot";

import styles from "./InspectDayCursor.module.scss";

const checkSameDay = (date1, date2) => {
  return (
    date1.toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }) ===
    date2.toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  );
  // return (
  //   date1.getFullYear() === date2.getFullYear() &&
  //   date1.getMonth() === date2.getMonth() &&
  //   date1.getDate() === date2.getDate()
  // );
};

const formatModeled = number => {
  const integer = parseInt(number);
  if (integer <= 10) {
    return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else if (integer <= 100) {
    return (Math.round(integer / 10) * 10)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    return (Math.round(integer / 100) * 100)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
};

const formatActuals = number =>
  Math.round(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

const InspectDailyCursor = props => {
  const [xOffset, yOffset] = [500 - props.x < 140 ? 4.75 : -4.75, 0];

  const popupDate = props.datum.x;
  const dateString = popupDate.toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  let latestIntervention = props.data.interventions
    .sort((inter1, inter2) => {
      if (
        Date.parse(inter1.intervention_start_date) >
        Date.parse(inter2.intervention_start_date)
      )
        return 1;
      if (
        Date.parse(inter1.intervention_start_date) <
        Date.parse(inter2.intervention_start_date)
      )
        return -1;
      return 0;
    })
    .filter(
      inter =>
        Date.parse(inter.intervention_start_date) < Date.parse(props.datum.x)
    )
    .slice(-1)[0] || { name: "Open" };

  // latestIntervention =
  //   latestIntervention !== undefined
  //     ? latestIntervention
  //     : "Unclear lockdown level";

  const latestInterColor = latestIntervention.name
    ? props.interventionColors[latestIntervention.name.split("_")[0]]
    : "white";

  let contactRate;
  if (props.contactPlotType === "pctChange") {
    contactRate = props.data.curves.pctChange.actuals.find(point =>
      checkSameDay(point.x, popupDate)
    );

    if (contactRate === undefined) {
      contactRate = props.data.curves.pctChange.model.find(point =>
        checkSameDay(point.x, popupDate)
      );
    }
  } else {
    contactRate = props.data.curves["R effective"].actuals.find(point =>
      checkSameDay(point.x, popupDate)
    );

    if (contactRate === undefined) {
      contactRate = props.data.curves["R effective"].model.find(point =>
        checkSameDay(point.x, popupDate)
      );
    }
  }

  const yAxis = Object.keys(props.data.curves).find(
    curveName => !["R effective", "pctChange"].includes(curveName)
  );

  const modeledCases = props.data.curves[yAxis].model.find(point =>
    checkSameDay(point.x, popupDate)
  );

  let actualCases, averageCases;
  if (modeledCases === undefined) {
    actualCases = props.data.curves[yAxis].actuals.find(point =>
      checkSameDay(point.x, popupDate)
    );
    averageCases =
      props.data.curves[yAxis].average &&
      props.data.curves[yAxis].average.find(point =>
        checkSameDay(point.x, popupDate)
      );
  }

  // get popup's y-axis metric label based on the currently selected
  // y-axis metric
  // {props.labelNames[yAxis]} COVID-19 <br /> patients today
  const getPopupLabelName = yAxisLabelName => {
    switch (yAxisLabelName) {
      case "Active Cases":
      default:
        return (
          <>
            current COVID-19 <br /> patients today (modeled)
          </>
        );
      case "Daily Cases":
        return (
          <>
            new COVID-19 <br /> cases today
          </>
        );
      case "Hospitalized":
        return (
          <>
            hospitalized COVID-19 <br /> patients today
          </>
        );
      case "ICU":
        return (
          <>
            hospitalized COVID-19 <br /> patients in ICU today
          </>
        );
      case "Cumulative Deaths":
        return (
          <>
            cumulative COVID-19 <br /> deaths today (modeled)
          </>
        );
      case "Daily Deaths":
        return (
          <>
            new COVID-19 <br /> deaths today
          </>
        );
    }
  };

  // get correct display name of policy type
  const dataName = latestIntervention.name.split("_")[0];
  const proposed = new Date(props.datum.x) > new Date();
  const displayName = getDisplayNameFromPolicyName({
    policyName: dataName,
    proposed,
  });
  return (
    <>
      {(props.activeTab === "caseload" &&
        popupDate < props.data.curves[yAxis].actuals_end) ||
      (props.activeTab === "interventions" && popupDate > new Date()) ? (
        <VictoryPortal>
          <g>
            <g
              transform={`translate(${props.x + xOffset} ,${Math.min(
                props.y + yOffset,
                props.activeTab === "interventions" ? 40 : 90
              )})`}
            >
              {/* This rectangle visualizes the SVG area of the foreignobject for debugging */}
              {/* <rect x="0" y="0" width="100" height="100" fill="firebrick"></rect> */}
              {props.showInfo && (
                <foreignObject
                  x={500 - props.x < 140 ? -140 : 0}
                  y="0"
                  width="140"
                  height="100"
                >
                  <section
                    className={
                      500 - props.x < 140 ? styles.leftPopup : styles.rightPopup
                    }
                  >
                    <header className={styles.titlebox}>
                      <h1>{dateString}</h1>
                      {popupDate > new Date() && (
                        <p>Click graph to add policy</p>
                      )}
                    </header>
                    <div
                      className={styles.policyIndicatorBar}
                      style={{ background: latestInterColor }}
                    />
                    <div className={styles.main}>
                      <div className={styles.policies}>
                        <h2>
                          Policies <br /> in effect
                        </h2>
                      </div>
                      <div className={styles.policiesContent}>
                        <div className={styles.policy}>
                          <span
                            style={{
                              backgroundColor:
                                latestIntervention.intervention_type ===
                                "intervention"
                                  ? "white"
                                  : latestInterColor,
                              borderColor: latestInterColor,
                            }}
                          />
                          <p style={{ color: latestInterColor }}>
                            {displayName}
                          </p>
                        </div>
                      </div>
                      <div className={styles.caseload}>
                        <h2>{props.labelNames[props.activeTab][yAxis]} </h2>
                      </div>
                      <div className={styles.caseloadContent}>
                        <p className={styles.number}>
                          {modeledCases === undefined
                            ? actualCases && formatActuals(actualCases.y)
                            : modeledCases && formatModeled(modeledCases.y)}
                        </p>
                        <p className={styles.label}>
                          {getPopupLabelName(
                            props.labelNames[props.activeTab][yAxis]
                          )}
                        </p>
                      </div>
                      {props.activeTab === "interventions" ? (
                        <>
                          <div className={styles.reduction}>
                            <h2>
                              {props.contactPlotType === "pctChange" ? (
                                <>
                                  Reduction <br /> in contacts
                                </>
                              ) : (
                                <>
                                  Effective R <br /> value
                                </>
                              )}
                            </h2>
                          </div>
                          <div className={styles.reductionContent}>
                            <p className={styles.number}>
                              {props.contactPlotType === "pctChange"
                                ? Math.round(100 - contactRate.y)
                                : contactRate.y}
                              {props.contactPlotType === "pctChange" ? "%" : ""}
                            </p>
                            <p className={styles.label}>
                              {props.contactPlotType === "pctChange" ? (
                                <>
                                  estimated contact reduction <br /> with
                                  policies in effect
                                </>
                              ) : (
                                <>
                                  estimated effective R <br /> with policies in
                                  effect
                                </>
                              )}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.reduction}>
                            <h2>
                              7-day <br /> average
                            </h2>
                          </div>
                          <div className={styles.reductionContent}>
                            <p className={styles.number}>
                              {averageCases && formatActuals(averageCases.y)}
                            </p>
                            <p className={styles.label}>
                              seven-day average{" "}
                              {yAxis === "infected_a" ? "cases" : "deaths"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                </foreignObject>
              )}
            </g>
            <path
              d={`M ${props.x - 5} ${
                props.activeTab === "interventions" ? -31 : 6
              } L ${props.x - 5} ${
                props.activeTab === "interventions" ? 130 : 180
              }`}
              style={{
                // stroke: popupDate > new Date() ? "#8D64DD" : "#8D64DD",
                stroke: latestInterColor,
                strokeWeight: popupDate > new Date() ? "1" : "0.25",
              }}
            />
            {popupDate > new Date() && (
              <g transform={`translate(${props.x - 9}, 26.5) scale(.33)`}>
                <circle
                  style={{ fill: "#FFFFFF" }}
                  cx="12.6"
                  cy="12.6"
                  r="12"
                />
                <path
                  style={{ fill: "#8D64DD" }}
                  d="M20.8,12.2l0,0.9c0,0.5-0.4,0.9-0.9,0.9h-6l0,6c0,0.5-0.4,0.9-0.9,0.9h-0.9c-0.5,0-0.9-0.4-0.9-0.9
  v-6h-6c-0.5,0-0.9-0.4-0.9-0.9v-0.9c0-0.5,0.4-0.9,0.9-0.9h6l0-6c0-0.5,0.4-0.9,0.9-0.9h0.9c0.5,0,0.9,0.4,0.9,0.9v6h6
  C20.4,11.3,20.8,11.7,20.8,12.2z M21.6,21.6c-4.9,4.9-13,4.9-17.9,0c-4.9-4.9-4.9-13,0-17.9c4.9-4.9,13-4.9,17.9,0
  C26.5,8.6,26.5,16.7,21.6,21.6z M23.6,12.6c0-6.1-4.9-11-11-11s-11,4.9-11,11s4.9,11,11,11S23.6,18.7,23.6,12.6z"
                />
              </g>
            )}
          </g>
        </VictoryPortal>
      ) : (
        <> </>
      )}
    </>
  );
};

export default InspectDailyCursor;
