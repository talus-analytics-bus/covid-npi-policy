import React from "react";
import { Link } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyLoaders";

import styles from "./PolicySummary.module.scss";

const PolicySummary = props => {
  const { iso3, state } = props.location;

  const description = props.wordLimit
    ? props.policy.desc
        .split(" ")
        .slice(0, props.wordLimit)
        .join(" ") + "..."
    : props.policy.desc;

  return (
    <section className={styles.policySummary}>
      <div className={styles.metadata}>
        <div>
          <h1>Effective from</h1>
          <h2>{props.policy.date_start_effective}</h2>
        </div>
        <div>
          <h1>Ended</h1>
          <h2>{props.policy.date_end_actual || "Active"}</h2>
        </div>
        <div>
          <h1>Published In</h1>
          <h2>{props.policy.policy_name}</h2>
        </div>
      </div>
      <p>{description}</p>
      <Link
        onClick={() => props.setScrollPos && props.setScrollPos(window.scrollY)}
        to={{
          pathname: `/policies/${iso3}/${state}/${props.id}`,
          state: {
            [CATEGORY_FIELD_NAME]: props.policy[CATEGORY_FIELD_NAME],
            [SUBCATEGORY_FIELD_NAME]: props.policy[SUBCATEGORY_FIELD_NAME],
          },
        }}
      >
        Policy Details
      </Link>
    </section>
  );
};

export default PolicySummary;
