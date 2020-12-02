import React from "react";
import { useParams, Link } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import styles from "./PolicySummary.module.scss";

const PolicySummary = props => {
  const { iso3, state } = useParams();

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
      <p>{props.policy.desc}</p>
      <Link
        to={{
          pathname: `/policies/${iso3}/${state}/${props.id}`,
          state: { [CATEGORY_FIELD_NAME]: "hi" },
        }}
      >
        Policy Details
      </Link>
    </section>
  );
};

export default PolicySummary;
