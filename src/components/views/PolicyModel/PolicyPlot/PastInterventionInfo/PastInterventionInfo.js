import React from "react";
import axios from "axios";
import { getDisplayNameFromPolicyName } from "../PolicyPlot";

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
    timeZone: "UTC",
  });

const formatDateForAPI = date => {
  if (date !== "") {
    return new Date(date).toISOString().split("T")[0];
  } else {
    return "";
  }
};

const phaseNames = {
  Lockdown: "Phase I",
  "Unclear lockdown level": "",
  "Mixed distancing levels": "",
  "No restrictions": "",
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
  "No restrictions": mixed,
  "Stay-at-home": phase2,
  "Safer-at-home": phase3,
  "Stay at home": phase2,
  "Safer at home": phase3,
  "New open": phase4,
  "New normal": phase4,
};

const PastInterventionInfo = props => {
  // a proposed or implemented policy?
  const proposed =
    new Date(props.pastInterventionProps.effectiveDate) > new Date();

  // get display name for policy type
  const displayName = getDisplayNameFromPolicyName({
    policyName: props.pastInterventionProps.policyName,
    proposed,
  });

  const [policyCount, setPolicyCount] = React.useState();

  React.useEffect(() => {
    const getPolicyCount = async () => {
      if (!proposed && props.effectiveDate) {
        axios
          .post(
            process.env.REACT_APP_API_URL +
              "/post/policy?fields=id&fields=place",
            {
              filters: {
                dates_in_effect: [
                  formatDateForAPI(props.effectiveDate),
                  formatDateForAPI(props.effectiveDate),
                ],
                primary_ph_measure: ["Social distancing"],
                ph_measure_details: [],
                area1: [states.find(state => state.abbr === props.state).name],
              },
              ordering: [["id", "asc"]],
            }
          )
          .then(response => setPolicyCount(response.data.data.length));
      }
    };
    getPolicyCount();
  });

  // console.log(policyCount);

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

  let policyURL = "";
  if (props.state !== undefined) {
    const stateFullName = states.find(state => state.abbr === props.state).name;

    policyURL =
      `/data?type=policy&filters_policy=` +
      `{%22primary_ph_measure%22:[%22Social%20distancing%22],` +
      `%22dates_in_effect%22:[%22${formatDateForAPI(props.effectiveDate)}%22,` +
      `%22${formatDateForAPI(props.effectiveDate)}%22],` +
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
        <h1 className={styles.title}>{displayName}</h1>
      </div>
      <div
        className={styles.policyIndicatorBar}
        style={{ background: props.interventionColors[props.policyName] }}
      />
      <div className={styles.content}>
        {proposed && <p>Proposal date: {formatDate(props.effectiveDate)}</p>}
        {!proposed && (
          <p className={styles.policyCount}>
            {policyCount} {policyCount > 1 ? "policies" : "policy"} in effect
          </p>
        )}
        {!proposed && (
          <p className={styles.asOfDate}>
            as of <span>{formatDate(props.effectiveDate)}</span>
          </p>
        )}
        <div className={styles.buttons}>
          {!proposed && (
            <a
              className={styles.policyLink}
              href={policyURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg x="0px" y="0px" viewBox="0 0 10.5 11.1">
                <path
                  d="M9.4,0H1C0.5,0,0,0.5,0,1v9c0,0.6,0.5,1,1,1h8.4c0.6,0,1-0.5,1-1V1C10.5,0.5,10,0,9.4,0z M6.8,7.9
  H2.1v-1h4.7V7.9z M8.4,5.8H2.1v-1h6.3V5.8z M8.4,3.7H2.1v-1h6.3V3.7z"
                />
              </svg>
              view in data table
            </a>
          )}
        </div>
        <a
          href="https://covid-local.org/metrics/"
          className={styles.COVIDLocalLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={localLogo} alt="COVID Local" />
          {phaseNames[props.policyName]} (view in COVID-Local)
        </a>
      </div>
    </section>
  );
};

export default PastInterventionInfo;
