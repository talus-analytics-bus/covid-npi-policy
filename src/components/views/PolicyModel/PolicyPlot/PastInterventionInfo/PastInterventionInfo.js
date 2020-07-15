import React from "react";

import states from "../../PolicyModel/states.js";

// local components
import { PopupMetrics } from "./content/PopupMetrics";

// styles and assets
import styles from "./PastInterventionInfo.module.scss";
import classNames from "classnames";

const formatDate = date =>
  new Date(date).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const PastInterventionInfo = props => {
  const setState = props.setPastInterventionProps;
  props = { ...props.pastInterventionProps };

  const width = 500;
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

  const dateObj = new Date(props.effectiveDate);
  const proposed = dateObj > new Date();
  const formattedDate = formatDate(dateObj);

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
      className={classNames(popupStyleName, {
        [styles.noArrow]: props.noArrow === true,
      })}
      onMouseLeave={() => {
        setState({
          ...props,
          policyName: "",
          effectiveDate: "",
        });
      }}
      style={{
        top: yPos,
        left: xPos,
        width: width,
        opacity: props.policyName !== "" ? 1 : 0,
        pointerEvents: props.policyName !== "" ? "all" : "none",
      }}
    >
      <div
        style={{ borderBottom: `6px solid ${props.policyColor}` }}
        className={styles.greySection}
      >
        <h1 className={styles.title}>{formattedDate}</h1>
      </div>
      <div className={styles.content}>{<PopupMetrics {...{ ...props }} />}</div>
    </section>
  );
};

export default PastInterventionInfo;
