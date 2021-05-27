import React from "react";

import styles from "../PolicyPage2.module.scss";

const LocationAndOfficials = ({ policy, policyPlace }) => (
  <section>
    <h2>Location and Officials</h2>
    <div className={styles.row}>
      <div className={styles.col}>
        <h3>Level of Government</h3>
        <p>
          <strong>{policyPlace && policyPlace.level}</strong>
        </p>
        <h3>Authorized By</h3>
        <p>
          <strong>{policy && policy.auth_entity[0].office}</strong>
        </p>
      </div>
      <div className={styles.col}>
        <h3>Authorizing Location</h3>
        <p>
          <strong>{policyPlace && policyPlace.loc.split(",")[0]}</strong>
        </p>
        <h3>Official</h3>
        <p>
          <strong>{policy && policy.auth_entity[0].official}</strong>
        </p>
      </div>
    </div>
  </section>
);

export default LocationAndOfficials;
