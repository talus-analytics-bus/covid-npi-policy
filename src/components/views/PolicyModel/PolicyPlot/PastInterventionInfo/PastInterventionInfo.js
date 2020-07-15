import React from "react";

import styles from "./PastInterventionInfo.module.scss";
import states from "../../PolicyModel/states.js";

const formatDate = date =>
  new Date(date).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const PastInterventionInfo = props => {
  const setState = props.setPastInterventionProps;
  props = { ...props.pastInterventionProps };

  const width = 300;
  // const arrowOffset = { x: 32, y: 28 }
  const arrowOffset = { x1: 8, x2: 19, y: 47 };
  const circleOffset = {
    x: (window.innerWidth * 0.0107) / 1.5,
    y: window.innerWidth * 0.0107,
  };
  // const circleOffset = 0

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
      `/data?filters=` +
      `{%22primary_ph_measure%22:[%22Social%20distancing%22],` +
      `%22dates_in_effect%22:[%22${props.effectiveDate}%22,` +
      `%22${props.effectiveDate}%22],` +
      `%22country_name%22:[%22United%20States%20of%20America%20(USA)%22],` +
      `%22area1%22:[%22${stateFullName}%22]}`;

    // alert(policyURL)
    // console.log(props.state)
    // console.log(policyURL)
  }

  return (
    <section
      display={props.policyName !== "" ? "block" : "none"}
      className={popupStyleName}
      style={{
        top: yPos,
        left: xPos,
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
        <h1 className={styles.title}>
          {props.policyName}{" "}
          {!proposed && props.policyName !== "Mixed distancing levels"
            ? "Policies Implemented"
            : ""}
          {proposed && "Policies Proposed"}
        </h1>
      </div>
      <div className={styles.content}>
        <p>
          {proposed ? "Proposal Date: " : "Effective Date: "}
          {formatDate(props.effectiveDate)}
        </p>
        {!proposed && (
          <a href={policyURL} target="_blank" rel="noopener noreferrer">
            view policies
          </a>
        )}
      </div>
    </section>
  );
};

export default PastInterventionInfo;
