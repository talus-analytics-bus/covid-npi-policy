import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyLoaders";

import styles from "./PolicySummary.module.scss";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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
  const [iso3, state] = location.pathname.split("/").slice(-2);

  const description = props.wordLimit
    ? props.policy.desc
        .split(" ")
        .slice(0, props.wordLimit)
        .join(" ") + "..."
    : props.policy.desc;

  const titleWords = props.policy.policy_name.split(" ");
  const titleExcerpt =
    titleWords.length > 10
      ? titleWords.slice(0, 10).join(" ") + "..."
      : titleWords.join(" ");

  return (
    <Link
      className={styles.policySummary}
      onClick={() => props.setScrollPos && props.setScrollPos(window.scrollY)}
      to={{
        pathname: `/policies/${iso3}/${state}/${props.id}`,
        state: {
          [CATEGORY_FIELD_NAME]: props.policy[CATEGORY_FIELD_NAME],
          [SUBCATEGORY_FIELD_NAME]: props.policy[SUBCATEGORY_FIELD_NAME],
        },
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
        {/* <div> */}
        {/*   <h1>Policy Target</h1> */}
        {/*   <h2>{props.policy.subtarget}</h2> */}
        {/* </div> */}
        <div>
          <h1>Published in</h1>
          <Tippy
            interactive={true}
            allowHTML={true}
            content={
              <p className={styles.ipopup}>{props.policy.policy_name}</p>
            }
            maxWidth={"30rem"}
            theme={"light"}
            placement={"top"}
            offset={[-30, 10]}
          >
            <h2>{titleExcerpt}</h2>
          </Tippy>
        </div>
      </div>
      <p>{description}</p>
      <div
        className={styles.policyButton}
        // onClick={() => props.setScrollPos && props.setScrollPos(window.scrollY)}
        // to={{
        //   pathname: `/policies/${iso3}/${state}/${props.id}`,
        //   state: {
        //     [CATEGORY_FIELD_NAME]: props.policy[CATEGORY_FIELD_NAME],
        //     [SUBCATEGORY_FIELD_NAME]: props.policy[SUBCATEGORY_FIELD_NAME],
        //   },
        // }}
      >
        Policy Details
      </div>
      {/* <span>Published in {titleExcerpt}</span> */}
    </Link>
  );
};

export default PolicySummary;
