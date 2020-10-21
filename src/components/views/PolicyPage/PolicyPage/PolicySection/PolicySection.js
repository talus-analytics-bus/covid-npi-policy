import React from "react";

import * as MiniMap from "../MiniMap/MiniMap";

import styles from "./PolicySection.module.scss";

const PolicySection = props => {
  let counties;
  let prevCounties;
  if (props.policy.auth_entity[0].place.iso3 === "USA") {
    counties = props.policy.place.map(place => place.area2.split(" County")[0]);
    prevCounties =
      props.policies[props.index - 1] &&
      props.policies[props.index - 1].place.map(
        place => place.area2.split(" County")[0]
      );
  }

  const renderMap = Boolean(
    props.index === 0 ||
      JSON.stringify(counties) !== JSON.stringify(prevCounties)
  );

  return (
    <section className={styles.policySection}>
      {renderMap ? (
        <MiniMap.SVG
          country={props.policy.auth_entity[0].place.iso3}
          state={props.policy.auth_entity[0].place.area1}
          counties={counties}
        />
      ) : (
        <div className={styles.placeHolder} />
      )}
      <div className={styles.description}>
        <h1>Section</h1>
        <h2>
          {props.policy.primary_ph_measure}: {props.policy.ph_measure_details}
        </h2>
        <h3>Target</h3>
        <h4>{props.policy.subtarget}</h4>
        <h3>Description</h3>
        <p>{props.policy.desc}</p>
      </div>
    </section>
  );
};

export default PolicySection;
