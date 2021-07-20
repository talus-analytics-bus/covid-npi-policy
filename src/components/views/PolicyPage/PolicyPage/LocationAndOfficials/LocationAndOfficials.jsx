import React from "react";
import MapFigure from "../MapFigure/MapFigure";

import styles from "../PolicyPage.module.scss";

const LocationAndOfficials = ({ state, policy, policyPlace }) => (
  <>
    <div className={styles.left}>
      <h2>JURISDICTION AND LOCATION</h2>
      <div className={styles.row}>
        <div className={styles.col}>
          <MapFigure {...{ policy, state, policyPlace }} />
        </div>
        <div className={styles.col}>
          <h3>Jurisdiction</h3>
          <p>{policyPlace && policyPlace.level}</p>
          <h3>Authorizing Location</h3>
          <p>{policyPlace && policyPlace.loc.split(",")[0]}</p>
        </div>
      </div>
    </div>
    <div className={styles.right}>
      <div className={styles.row}>
        <div className={styles.col}>
          <h3>Authorized By</h3>
          <p>{policy && policy.auth_entity[0].office}</p>
          <h3>Official</h3>
          <p>{policy && policy.auth_entity[0].official}</p>
        </div>
      </div>
    </div>
  </>
);

export default LocationAndOfficials;
