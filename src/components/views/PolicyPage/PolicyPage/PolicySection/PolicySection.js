import React from "react";

import * as MiniMap from "../MiniMap/MiniMap";

import styles from "./PolicySection.module.scss";

const PolicySection = props => (
  <section className={styles.policySection}>
    {console.log(props.policy)}
    <MiniMap.SVG state={props.policy.auth_entity[0].place.area1} />
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

export default PolicySection;
