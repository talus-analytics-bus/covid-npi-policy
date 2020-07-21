import React from "react";
import { VictoryPortal } from "victory";

import styles from "./InspectDayCursor.module.scss";

const checkSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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

  const popupDate = new Date(props.datum.x);
  const dateString = popupDate.toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  let latestIntervention = props.data.interventions
    .sort((inter1, inter2) => {
      if (inter1.intervention_start_date > inter2.intervention_start_date)
        return 1;
      if (inter1.intervention_start_date < inter2.intervention_start_date)
        return -1;
      return 0;
    })
    .filter(
      inter =>
        Date.parse(inter.intervention_start_date) < Date.parse(props.datum.x)
    )
    .slice(-1)[0] || { name: "Unclear lockdown level" };

  // latestIntervention =
  //   latestIntervention !== undefined
  //     ? latestIntervention
  //     : "Unclear lockdown level";

  const latestInterColor = latestIntervention.name
    ? props.interventionColors[latestIntervention.name.split("_")[0]]
    : "white";

  let pctChange = props.data.curves.pctChange.actuals.find(point =>
    checkSameDay(point.x, popupDate)
  );

  if (pctChange === undefined) {
    pctChange = props.data.curves.pctChange.model.find(point =>
      checkSameDay(point.x, popupDate)
    );
  }

  const yAxis = Object.keys(props.data.curves).find(
    curveName => !["R effective", "pctChange"].includes(curveName)
  );

  const modeledCases = props.data.curves[yAxis].model.find(point =>
    checkSameDay(point.x, popupDate)
  );

  let actualCases;
  if (modeledCases === undefined) {
    actualCases = props.data.curves[yAxis].actuals.find(point =>
      checkSameDay(point.x, popupDate)
    );
  }

  // get popup's y-axis metric label based on the currently selected
  // y-axis metric
  // {props.labelNames[yAxis]} COVID-19 <br /> patients today
  const getPopupLabelName = yAxisLabelName => {
    switch (yAxisLabelName) {
      case "Caseload":
      default:
        return (
          <>
            current COVID-19 <br /> patients today
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
      case "Deaths":
        return (
          <>
            cumulative COVID-19 <br /> deaths today
          </>
        );
    }
  };

  return (
    <VictoryPortal>
      <g>
        <g
          transform={`translate(${props.x + xOffset} ,${Math.min(
            props.y + yOffset,
            40
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
                  {popupDate > new Date() && <p>Click graph to add policy</p>}
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
                        {latestIntervention.name.split("_")[0]} policies
                      </p>
                    </div>
                  </div>
                  <div className={styles.caseload}>
                    <h2>
                      {props.labelNames[yAxis]}{" "}
                      {modeledCases === undefined ? "(actual)" : "(modeled)"}
                    </h2>
                  </div>
                  <div className={styles.caseloadContent}>
                    <p className={styles.number}>
                      {modeledCases === undefined
                        ? formatActuals(actualCases.y)
                        : formatModeled(modeledCases.y)}
                    </p>
                    <p className={styles.label}>
                      {getPopupLabelName(props.labelNames[yAxis])}
                    </p>
                  </div>
                  <div className={styles.reduction}>
                    <h2>
                      Reduction <br /> in contacts
                    </h2>
                  </div>
                  <div className={styles.reductionContent}>
                    <p className={styles.number}>{pctChange.y}%</p>
                    <p className={styles.label}>
                      estimated contact reduction <br /> with policies in effect
                    </p>
                  </div>
                </div>
              </section>
            </foreignObject>
          )}
        </g>
        <path
          d={`M ${props.x - 5} -31 L ${props.x - 5} 130`}
          style={{
            // stroke: popupDate > new Date() ? "#8D64DD" : "#aaa",
            stroke: latestInterColor,
            strokeWeight: popupDate > new Date() ? "1" : "0.25",
          }}
        />
        {popupDate > new Date() && (
          <g transform={`translate(${props.x - 9}, 26.5) scale(.33)`}>
            <circle style={{ fill: "#FFFFFF" }} cx="12.6" cy="12.6" r="12" />
            <path
              style={{ fill: latestInterColor }}
              d="M20.8,12.2l0,0.9c0,0.5-0.4,0.9-0.9,0.9h-6l0,6c0,0.5-0.4,0.9-0.9,0.9h-0.9c-0.5,0-0.9-0.4-0.9-0.9
  v-6h-6c-0.5,0-0.9-0.4-0.9-0.9v-0.9c0-0.5,0.4-0.9,0.9-0.9h6l0-6c0-0.5,0.4-0.9,0.9-0.9h0.9c0.5,0,0.9,0.4,0.9,0.9v6h6
  C20.4,11.3,20.8,11.7,20.8,12.2z M21.6,21.6c-4.9,4.9-13,4.9-17.9,0c-4.9-4.9-4.9-13,0-17.9c4.9-4.9,13-4.9,17.9,0
  C26.5,8.6,26.5,16.7,21.6,21.6z M23.6,12.6c0-6.1-4.9-11-11-11s-11,4.9-11,11s4.9,11,11,11S23.6,18.7,23.6,12.6z"
            />
          </g>
        )}
      </g>
    </VictoryPortal>
  );
};

export default InspectDailyCursor;
