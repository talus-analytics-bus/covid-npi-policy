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
  console.log(props.data);
  const [xOffset, yOffset] = [500 - props.x < 140 ? 4.75 : -4.75, 0];

  const popupDate = new Date(props.datum.x);
  const dateString = popupDate.toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let latestIntervention =
    props.data.interventions
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
      .slice(-1)[0] || "Unclear lockdown level";

  // latestIntervention =
  //   latestIntervention !== undefined
  //     ? latestIntervention
  //     : "Unclear lockdown level";

  const latestInterColor = latestIntervention.name
    ? props.interventionColors[latestIntervention.name]
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

  console.log(popupDate.toISOString());

  console.log(pctChange);

  return (
    <VictoryPortal>
      <g
        transform={`translate(${props.x + xOffset} ,${Math.min(
          props.y + yOffset,
          40
        )})`}
      >
        {/* This rectangle visualizes the SVG area of the foreignobject for debugging */}
        {/* <rect x="0" y="0" width="100" height="100" fill="firebrick"></rect> */}
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
                  Policies <br /> in place
                </h2>
              </div>
              <div className={styles.policiesContent}>
                <div className={styles.policy}>
                  <span style={{ background: latestInterColor }} />
                  <p style={{ color: latestInterColor }}>
                    {latestIntervention.name} Policies
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
                  {props.labelNames[yAxis]} COVID-19 <br /> patients today
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
                  estimated contact reduction <br /> with policies in place
                </p>
              </div>
            </div>
          </section>
        </foreignObject>
      </g>
    </VictoryPortal>
  );
};

export default InspectDailyCursor;
