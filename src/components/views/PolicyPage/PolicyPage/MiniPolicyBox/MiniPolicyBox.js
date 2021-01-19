import React from "react";
import { Link } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./MiniPolicyBox.module.scss";

const TITLE_WORD_LIMIT = 10;

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const MiniPolicyBox = ({ policy, path }) => {
  // console.log(policyLinkPath);

  // console.log(policy);

  // debugger;

  const iso3 = policy.auth_entity[0].place.loc.includes("(")
    ? policy.auth_entity[0].place.loc.split("(")[1].replace(")", "")
    : policy.auth_entity[0].place.loc;

  let state;
  if (iso3 === "USA") {
    const area1 = policy.auth_entity[0].place.area1;
    state = area1 === "Unspecified" ? "national" : area1;
    console.log(area1);
  } else {
    state = "national";
  }

  const linkHref = `/policies/${iso3}/${state}/${policy.id}`;
  // const policyLinkPath = path && [...path.slice(0, -1), `ID${policy.id}`];

  const titleWords = policy.policy_name.split(" ");
  const truncateTitle = titleWords.length > TITLE_WORD_LIMIT;
  const title = truncateTitle
    ? titleWords.slice(0, TITLE_WORD_LIMIT).join(" ") + "..."
    : titleWords.join(" ");

  return (
    <Link
      className={styles.miniPolicyBox}
      to={{
        pathname: linkHref,
        state: undefined,
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
        <h2>{title}</h2>
      </section>
    </Link>
  );
};

// <p>{policy.date_issued}</p>;

export default MiniPolicyBox;
