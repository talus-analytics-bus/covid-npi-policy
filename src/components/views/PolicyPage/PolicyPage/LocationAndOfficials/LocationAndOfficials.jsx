import React from "react";
import MapFigure from "../MapFigure/MapFigure";

import styles from "../PolicyPage.module.scss";

const LocationAndOfficials = ({ state, policy, policyPlace }) => (
  <>
    <div className={styles.left}>
      <h2>JURISDICTION AND LOCATION</h2>
      <div className={styles.row} style={{ justifyContent: "space-between" }}>
        <div className={styles.col}>
          <h3>Jurisdiction</h3>
          <p>{policyPlace && policyPlace.level}</p>
          <h3>Authorizing Location</h3>
          <p>{policyPlace && policyPlace.loc.split(",")[0]}</p>
          <h3>Relevant Authority</h3>
          <p>{policy && policy.authority_name}</p>
        </div>
        <div
          className={styles.col}
          style={{ marginRight: "5em", flexShrink: 0 }}
        >
          <h3>Authorized By</h3>
          <p>{policy && policy.auth_entity[0].office}</p>
          <h3>Official</h3>
          <p>{policy && policy.auth_entity[0].official}</p>
        </div>
      </div>
    </div>
    <div className={styles.right}>
      <div className={styles.row}>
        <div className={styles.col}>
          <MapFigure {...{ policy, state, policyPlace }} />
        </div>
      </div>
    </div>
  </>
);

export default LocationAndOfficials;
