import React from "react";
import { Link, useLocation } from "react-router-dom";

import { Policy } from "../../../misc/Queries";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../PolicyRouter/PolicyLoaders";

import * as MiniMap from "../MiniMap/MiniMap";
import PolicySummary from "../PolicySummary/PolicySummary";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./PolicyPage.module.scss";

const PolicyPage = props => {
  const location = useLocation();
  const [iso3, state, policyID] = location.pathname.split("/").slice(-3);

  // Always want this page to scroll to the top
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const policyObjectPath = Object.values(location.state);

  console.log([iso3, state, policyID]);
  // console.log(location.pathname.split("/").slice(-3));

  // console.log(props.policyObject);
  // console.log(location);
  // console.log(policyObjectPath);

  const relatedPolicies =
    props.policyObject &&
    props.policyObject[location.state[CATEGORY_FIELD_NAME]] &&
    props.policyObject[location.state[CATEGORY_FIELD_NAME]][
      location.state[SUBCATEGORY_FIELD_NAME]
    ];

  // console.log(relatedPolicies);

  const policy = relatedPolicies && relatedPolicies[`ID${policyID}`];

  // console.log(policy);

  return (
    <article className={styles.policyPage}>
      <Link to={`/policies/${iso3}/${state}/`}>
        {"<"} return to full list of {state.toLowerCase()} policies
      </Link>
      <header>
        <div className={styles.row}>
          <PolicyCategoryIcon
            category={policyObjectPath && policyObjectPath[0]}
          />
          <h1>
            {state === "national" ? iso3 : state}{" "}
            {policy && `${policyObjectPath[0]}: ${policyObjectPath[1]}`}
            {/* ({policy && policyID}) */}
          </h1>
        </div>
      </header>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2>Effective from</h2>
              <p>{policy && policy.date_start_effective}</p>
            </div>
            <div className={styles.col}>
              <h2>Ended</h2>
              <p>{(policy && policy.date_end_actual) || "Active"}</p>
            </div>
          </div>

          <h2>Target</h2>
          <p>{policy && policy.target}</p>

          <h2>Description</h2>
          <p>{policy && policy.desc}</p>

          <h2>Published in</h2>
          <p>[Document name from API]{policy && policy.policy_law_name}</p>
        </div>
        <div className={styles.col}>
          <h2>Effective Area</h2>
          <div className={styles.miniMapHolder}>
            <MiniMap.SVG
              country={iso3}
              state={state && state}
              counties={["Unspecified"]}
            />
          </div>
        </div>
      </div>

      <section className={styles.metadata}>
        <div className={styles.leftCol}>
          <h2>Authority</h2>
          <h3>Office</h3>
          <p>[office]</p>
          <h3>Official</h3>
          <p>[official]</p>
        </div>
        <div className={styles.rightCol}>
          <h2>Government</h2>
          <p>[gov]</p>
          {true && (
            <>
              <h2>State Structure</h2>
              <div className={styles.cols}>
                <div className={styles.col}>
                  <h3>Home Rule</h3>
                  <p>[rules]</p>
                  {/* <p>{auth_entity && auth_entity.place.home_rule}</p> */}
                </div>
                <div className={styles.col}>
                  <h3>Dillon's Rule</h3>
                  {/* <p>{auth_entity && auth_entity.place.dillons_rule}</p> */}
                  <p>[rules]</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <h3>Policy Dates for plot</h3>
      {relatedPolicies &&
        Object.values(relatedPolicies).map((policy, index) => (
          <p key={index}>
            {policy && policy.date_start_effective},{" "}
            {policy && policy.date_end_actual}
          </p>
        ))}
      <h3>Related policies</h3>
      <div className={styles.relatedScroller}>
        {relatedPolicies &&
          Object.entries(relatedPolicies).map(
            ([relatedPolicyID, relatedPolicy]) =>
              relatedPolicyID.replace("ID", "") !== policyID && (
                <div className={styles.policySummaryWidth}>
                  <PolicySummary
                    location={{ iso3, state }}
                    key={relatedPolicyID}
                    id={relatedPolicyID.replace("ID", "")}
                    policy={relatedPolicy}
                    wordLimit={15}
                  />
                </div>
              )
          )}
      </div>
    </article>
  );
};

export default PolicyPage;
