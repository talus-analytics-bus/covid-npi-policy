import React from "react";
import { Link, useLocation } from "react-router-dom";

import styles from "./PolicySummary.module.scss";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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

const PolicySummary = props => {
  const location = useLocation();
  const [iso3, state] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-2);

  const descriptionWords = props.policy.desc.split(" ");

  const truncateDescription =
    props.wordLimit && descriptionWords.length > props.wordLimit;

  const description = truncateDescription
    ? descriptionWords.slice(0, props.wordLimit).join(" ") + "..."
    : props.policy.desc;

  const titleWords = props.policy.policy_name.split(" ");
  const truncateTitle = titleWords.length > TITLE_WORD_LIMIT;
  const title = truncateTitle
    ? titleWords.slice(0, TITLE_WORD_LIMIT).join(" ") + "..."
    : titleWords.join(" ");

  const idNumber = props.path.slice(-1)[0].replace("ID", "");

  return (
    <Link
      className={styles.policySummary}
      onClick={() => props.setScrollPos && props.setScrollPos(window.scrollY)}
      to={{
        pathname: `/policies/${iso3}/${state}/${idNumber}`,
        state: { path: props.path },
      }}
    >
      <div className={styles.metadata}>
        <div>
          <h1>Effective from</h1>
          <h2>{formatDate(new Date(props.policy.date_start_effective))}</h2>
        </div>
        <div>
          <h1>Ended</h1>
          <h2>
            {props.policy.date_end_actual
              ? formatDate(new Date(props.policy.date_end_actual))
              : "Active"}
          </h2>
        </div>
        <div>
          <h1>Published in</h1>
          {truncateTitle ? (
            <Tippy
              interactive={true}
              allowHTML={true}
              content={
                <p className={styles.ipopup}>{props.policy.policy_name}</p>
              }
              maxWidth={"40rem"}
              theme={"light"}
              placement={"bottom"}
              offset={[-30, 10]}
            >
              <h2>{title}</h2>
            </Tippy>
          ) : (
            <h2>{title}</h2>
          )}
        </div>
      </div>
      <p>
        {description} {truncateDescription && <span>read more</span>}
      </p>
      <div className={styles.policyButton}>Policy Details</div>
    </Link>
  );
};

export default PolicySummary;
