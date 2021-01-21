import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./MiniPolicyBox.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const TITLE_CHAR_LIMIT = 32;

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
  const [pageIso3, pageState] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  const policyContextConsumer = React.useContext(policyContext);

  const {
    setPolicyObject,
    setStatus,
    setPolicyFilters,
  } = policyContextConsumer;

  const [, setScrollPos] = policyContextConsumer.policyListScrollPos;

  // console.log(policyLinkPath);

  // console.log(policy);

  // debugger;

  const iso3 = policy.auth_entity[0].place.iso3;

  let state;
  if (iso3 === "USA") {
    const area1 = policy.auth_entity[0].place.area1;
    state = area1 === "Unspecified" ? "national" : area1;
  } else {
    state = "national";
  }

  const linkHref = `/policies/${iso3}/${state}/${policy.id}`;
  // const policyLinkPath = path && [...path.slice(0, -1), `ID${policy.id}`];

  const truncateTitle = policy.policy_name.length > TITLE_CHAR_LIMIT;
  const title = truncateTitle
    ? policy.policy_name.slice(0, TITLE_CHAR_LIMIT) + "..."
    : policy.policy_name;

  const clickPolicyLink = e => {
    if (iso3 !== pageIso3 || state !== pageState) {
      setScrollPos(0);
      setPolicyObject({});
      setStatus(prev => ({ ...prev, policies: "initial" }));
      setPolicyFilters({});
    }
  };

  return (
    <Link
      className={styles.miniPolicyBox}
      onClick={clickPolicyLink}
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
