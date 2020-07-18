import React from "react";
import axios from "axios";

import styles from "./PastInterventionInfo.module.scss";
import states from "../../PolicyModel/states.js";

import localLogo from "../../../../common/MapboxMap/plugins/assets/icons/logo-local-pill.png";

import phase1 from "../../../../common/MapboxMap/plugins/assets/icons/phase-1.png";
import phase2 from "../../../../common/MapboxMap/plugins/assets/icons/phase-2.png";
import phase3 from "../../../../common/MapboxMap/plugins/assets/icons/phase-3.png";
import phase4 from "../../../../common/MapboxMap/plugins/assets/icons/phase-4.png";
import mixed from "../../../../common/MapboxMap/plugins/assets/icons/phase-mixed.png";

const formatDate = date =>
  new Date(date).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const phaseNames = {
  Lockdown: "Phase I",
  "Unclear lockdown level": "",
  "Mixed distancing levels": "",
  "Stay-at-home": "Phase II",
  "Safer-at-home": "Phase III",
  "Stay at home": "Phase II",
  "Safer at home": "Phase III",
  "New open": "Phase IV",
  "New normal": "Phase IV",
};

const phaseIcons = {
  Lockdown: phase1,
  "Unclear lockdown level": mixed,
  "Mixed distancing levels": mixed,
  "Stay-at-home": phase2,
  "Safer-at-home": phase3,
  "Stay at home": phase2,
  "Safer at home": phase3,
  "New open": phase4,
  "New normal": phase4,
};

const PastInterventionInfo = props => {
  const [policyCount, setPolicyCount] = React.useState();
  React.useEffect(() => {
    const getPolicyCount = async () => {
      if (props.effectiveDate) {
        axios
          .post(
            process.env.REACT_APP_API_URL +
              "/post/policy?fields=id&fields=place",
            {
              filters: {
                dates_in_effect: [
                  new Date(props.effectiveDate).toISOString().split("T")[0],
                  new Date(props.effectiveDate).toISOString().split("T")[0],
                ],
                primary_ph_measure: ["Social distancing"],
                ph_measure_details: [],
                area1: [states.find(state => state.abbr === props.state).name],
              },
            }
          )
          .then(response => setPolicyCount(response));
      }
    };
    getPolicyCount();
  });

  console.log(policyCount);

  const setState = props.setPastInterventionProps;
  props = { ...props.pastInterventionProps };

  const width = 350;
  // const arrowOffset = { x: 32, y: 28 }
  const arrowOffset = { x1: 8, x2: 19, y: 42 };
  // const circleOffset = {
  //   x: (window.innerWidth * 0.0107) / 1.5,
  //   y: window.innerWidth * 0.0107,
  // };

  const circleOffset = { x: props.dotSize / 2, y: props.dotSize / 2 };

  const xPos =
    props.x < window.innerWidth / 2
      ? props.x + arrowOffset.x1 + circleOffset.x * 2
      : props.x - arrowOffset.x2 - width + circleOffset.x;

  const yPos = props.y - arrowOffset.y + circleOffset.y;

  const popupStyleName =
    props.x < window.innerWidth / 2 ? styles.leftPopup : styles.rightPopup;

  const proposed = new Date(props.effectiveDate) > new Date();

  let policyURL = "";
  if (props.state !== undefined) {
    const stateFullName = states.find(state => state.abbr === props.state).name;

    policyURL =
      `/data?type=policy&filters_policy=` +
      `{%22primary_ph_measure%22:[%22Social%20distancing%22],` +
      `%22dates_in_effect%22:[%22${props.effectiveDate}%22,` +
      `%22${props.effectiveDate}%22],` +
      `%22country_name%22:[%22United%20States%20of%20America%20(USA)%22],` +
      `%22area1%22:[%22${stateFullName}%22]}`;
  }

  return (
    <section
      display={props.policyName !== "" ? "block" : "none"}
      className={popupStyleName}
      style={{
        top: yPos ? yPos : 0,
        left: xPos ? xPos : 0,
        width: width,
        opacity: props.policyName !== "" ? 1 : 0,
        pointerEvents: props.policyName !== "" ? "all" : "none",
      }}
      onMouseLeave={() => {
        setState({
          ...props,
          policyName: "",
          effectiveDate: "",
        });
      }}
    >
      <div className={styles.greySection}>
        {phaseIcons[props.policyName] && (
          <img
            src={phaseIcons[props.policyName]}
            alt={phaseNames[props.policyName] + " icon"}
          />
        )}
        <h1 className={styles.title}>
          {props.policyName}
          <br />
          {!proposed && props.policyName !== "Mixed distancing levels"
            ? "policies implemented"
            : ""}
          {proposed && "policies proposed"}
        </h1>
      </div>
      <div
        className={styles.policyIndicatorBar}
        style={{ background: props.interventionColors[props.policyName] }}
      />
      <div className={styles.content}>
        {proposed && <p>Proposal Date: {formatDate(props.effectiveDate)}</p>}
        {!proposed && (
          <a
            className={styles.policyLink}
            href={policyURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View all policies <br /> in effect
          </a>
        )}
        {!proposed && (
          <p className={styles.asOfDate}>
            {" "}
            as of <span>{formatDate(props.effectiveDate)}</span>
          </p>
        )}
        <a
          href="https://covid-local.org/metrics/"
          className={styles.COVIDLocalLink}
        >
          <img src={localLogo} alt="COVID Local" />
          {phaseNames[props.policyName]} (view in COVID-Local)
        </a>
      </div>
    </section>
  );
};

export default PastInterventionInfo;
