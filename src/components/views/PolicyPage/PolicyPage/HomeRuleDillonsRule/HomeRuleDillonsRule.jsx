import React from "react";

import styles from "./HomeRuleDillonsRule.module.scss";

const HomeRuleDillonsRule = ({ policyPlace, policy }) => (
  <div className={styles.dillonsRule}>
    <h3>Home Rule</h3>
    <p>
      <strong>{policyPlace && policyPlace.home_rule}</strong>
    </p>
    <h3>Dillon's Rule</h3>
    <p>
      <strong>{policy && policy.auth_entity[0].place.dillons_rule}</strong>
    </p>
  </div>
);

export default HomeRuleDillonsRule;
