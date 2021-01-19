import React from "react";
import { Link } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./MiniPolicyBox.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const MiniPolicyBox = ({ policy, iso3, state, path }) => {
  const linkHref = `/policies/${iso3}/${state}/${policy.id}`;
  // const policyLinkPath = path && [...path.slice(0, -1), `ID${policy.id}`];

  // console.log(policyLinkPath);

  return (
    <Link
      className={styles.miniPolicyBox}
      to={{
        pathname: linkHref,
        // providing the path here breaks
        // it and I have NO IDEA WHY because
        // this is exactly the same link path
        // used in the bars in the policy plot
        // in PolicyBar.js
        // state: { path: policyLinkPath },
      }}
    >
      <PolicyCategoryIcon category={policy[CATEGORY_FIELD_NAME]} />
      <section className={styles.description}>
        <h1>
          {`${policy.auth_entity[0].place.loc.split(",")[0]} 
        ${policy[CATEGORY_FIELD_NAME]}: 
        ${policy[SUBCATEGORY_FIELD_NAME]} issued 
        ${formatDate(new Date(policy.date_issued))}`}
        </h1>
        <h2>{policy.policy_name}</h2>
      </section>
    </Link>
  );
};

// <p>{policy.date_issued}</p>;

export default MiniPolicyBox;
