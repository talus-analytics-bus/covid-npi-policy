import React from "react";
import { Link, useLocation } from "react-router-dom";

import { loadFullPolicy } from "../PolicyRouter/PolicyLoaders";

import { getFirstPathFromObject, getObjectByPath } from "../objectPathTools";

import * as MiniMap from "../MiniMap/MiniMap";
import PolicySummary from "../PolicySummary/PolicySummary";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./PolicyPage.module.scss";

const PolicyPage = props => {
  const location = useLocation();
  const [iso3, state, policyID] = location.pathname.split("/").slice(-3);

  // Always want this page to scroll to the top
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const { policyObject, setPolicyObject } = React.useContext(policyContext);

  const policyObjectPath = location.state
    ? location.state.path
    : getFirstPathFromObject({ obj: policyObject, idPattern: /^ID/ });

  const policy = getObjectByPath({ obj: policyObject, path: policyObjectPath });

  let relatedPolicies;

  React.useEffect(() => {
    loadFullPolicy({
      stateSetter: setPolicyObject,
      filters: {
        id: [Number(policyID)],
      },
    });
  }, [policyID, setPolicyObject]);

  // React.useEffect(() => {
  //   // console.log("related policies check");
  //   // console.log(policy);
  //   // console.log(relatedPolicies);
  //   // if (policy && Object.keys(relatedPolicies).length <= 1) {
  //   //   console.log("get related policies");
  //   //   const filters = {
  //   //     iso3: [iso3],
  //   //     [CATEGORY_FIELD_NAME]: [policy[CATEGORY_FIELD_NAME]],
  //   //     [SUBCATEGORY_FIELD_NAME]: [policy[SUBCATEGORY_FIELD_NAME]],
  //   //   };
  //   //   if (state !== "national") {
  //   //     filters["area1"] = [state];
  //   //   }
  //   //   loadPolicyDescriptions({
  //   //     stateSetter: setPolicyObject,
  //   //     filters: filters,
  //   //   });
  //   // }
  // }, [relatedPolicies, iso3, state, policy, setPolicyObject]);

  const policyPlace =
    policy && policy.auth_entity && policy.auth_entity[0].place;

  return (
    <article className={styles.policyPage}>
      <Link to={`/policies/${iso3}/${state}`}>
        {"<"} return to full list of {state.toLowerCase()} policies
      </Link>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.row}>
            <header>
              <div className={styles.row}>
                <PolicyCategoryIcon
                  category={policyObjectPath && policyObjectPath[0]}
                />
                <h1>
                  {state === "national" ? iso3 : state}{" "}
                  {policy && `${policyObjectPath[0]}: ${policyObjectPath[2]}`}
                </h1>
              </div>
            </header>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2>Effective from</h2>
              <p>{policy && policy.date_start_effective}</p>
            </div>
            <div className={styles.col}>
              {/* <h2>Ended</h2> */}
              <p>{(policy && policy.date_end_actual) || "Active"}</p>
            </div>
          </div>

          <h2>Target</h2>
          <p>{policy && policy.subtarget}</p>

          <h2>Description</h2>
          <p>{policy && policy.desc}</p>

          <h2>Published in</h2>
          <p>{policy && policy.policy_name}</p>
          <button>EXPLORE SOURCE</button>
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
          <p>{policy && policy.auth_entity && policy.auth_entity[0].office}</p>
          <h3>Official</h3>
          <p>
            {policy && policy.auth_entity && policy.auth_entity[0].official}
          </p>
        </div>
        <div className={styles.rightCol}>
          <h2>Government</h2>
          <p>
            {policyPlace &&
              (policyPlace.level === "Local"
                ? policyPlace.area2
                : policyPlace.area1)}
          </p>
          {iso3 === "USA" && (
            <>
              <h2>State Structure</h2>
              <div className={styles.cols}>
                <div className={styles.col}>
                  <h3>Home Rule</h3>
                  <p>{policyPlace && policyPlace.home_rule}</p>
                </div>
                <div className={styles.col}>
                  <h3>Dillon's Rule</h3>
                  <p>{policyPlace && policyPlace.dillons_rule}</p>
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
                <div
                  key={relatedPolicyID}
                  className={styles.policySummaryWidth}
                >
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
