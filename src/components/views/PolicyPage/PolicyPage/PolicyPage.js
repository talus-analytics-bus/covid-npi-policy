import React from "react";
import { Link, useLocation } from "react-router-dom";

import { loadFullPolicy } from "../PolicyRouter/PolicyLoaders";

import { getFirstPathFromObject, getObjectByPath } from "../objectPathTools";

import * as MiniMap from "../MiniMap/MiniMap";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";
import OthersInDocument from "./OthersInDocument/OthersInDocument";
import RelatedPolicies from "./RelatedPolicies/RelatedPolicies";

import CaseloadAndPolicies from "./CaseloadAndPolicies/CaseloadAndPolicies";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./PolicyPage.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const PolicyPage = props => {
  const location = useLocation();
  const [iso3, state, policyID] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-3);

  // Always want this page to scroll to the top
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const { policyObject, setPolicyObject } = React.useContext(policyContext);

  const policyObjectPath = location.state
    ? location.state.path
    : getFirstPathFromObject({ obj: policyObject, idPattern: /^ID/ });

  const policy = getObjectByPath({ obj: policyObject, path: policyObjectPath });

  React.useEffect(() => {
    console.log("loadFullPolicy");
    loadFullPolicy({
      stateSetter: setPolicyObject,
      filters: {
        id: [Number(policyID)],
        // iso3: [iso3],
      },
    });
  }, [policyID, iso3, setPolicyObject]);

  const policyPlace =
    policy && policy.auth_entity && policy.auth_entity[0].place;

  const policyTargetList = policy && policy.subtarget;

  //   console.log(policyID);
  //   // console.log(policyTargetList);
  //
  //   React.useEffect(() => {
  //     console.log("check policy");
  //     if (policy && `${policy.id}` !== policyID) {
  //       alert("wrong policy");
  //     }
  //   }, [policy, policyID]);

  return (
    <article className={styles.policyPage}>
      <div className={styles.breadCrumbs}>
        <PolicyCategoryIcon
          category={policyObjectPath && policyObjectPath[0]}
        />
        <Link to={`/policies/${iso3}/${state}`}>
          {policyObjectPath &&
            policyObjectPath
              .filter(s => s !== "children")
              .slice(0, -2)
              .join(" / ")}
          &nbsp; / {policyObjectPath && policyObjectPath.slice(-3)[0]}
        </Link>
      </div>

      <section className={styles.headerSection}>
        <div className={styles.row}>
          <div className={styles.wideCol}>
            <div className={styles.row}>
              <header>
                <div className={styles.row}>
                  <h1>
                    {policy &&
                      `${policy.auth_entity[0].place.loc.split(",")[0]} 
                      ${policy.primary_ph_measure}: 
                      ${policy.ph_measure_details} issued 
                      ${formatDate(new Date(policy.date_start_effective))}`}
                  </h1>
                </div>
              </header>
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <h3>Published in</h3>
                <p>
                  <strong>{policy && policy.policy_name}</strong>
                </p>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <h3>Effective from</h3>
                <p>
                  <strong>
                    {policy &&
                      formatDate(new Date(policy.date_start_effective))}
                  </strong>
                </p>
              </div>
              <div className={styles.col}>
                <h3>Ended</h3>
                <p>
                  <strong>
                    {policy &&
                      ((policy.date_end_actual &&
                        formatDate(new Date(policy.date_end_actual))) ||
                        "Active")}
                  </strong>
                </p>
              </div>
              <div className={styles.col}>
                <h3>Date Issued</h3>
                <p>
                  <strong>
                    {policy && formatDate(new Date(policy.date_issued))}
                  </strong>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.rightCol}>
            <div className={styles.miniMapHolder}>
              <h3>Effective Area</h3>
              <MiniMap.SVG
                country={iso3}
                state={state && state}
                counties={
                  policy
                    ? [policy.auth_entity[0].place.area2.split(" County")[0]]
                    : []
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.policyDetails}>
        <h2>Policy Details</h2>
        <div className={styles.row}>
          <div className={styles.leftCol}>
            <h3>Relevant Authority</h3>
            <p>
              <strong>{policy && policy.authority_name}</strong>
            </p>
            <h3>Description</h3>
            <p>{policy && policy.desc}</p>
            <button>EXPLORE SOURCE</button>
          </div>
          <div className={styles.rightCol}>
            <h3>Policy Category</h3>
            <p>
              <strong>{policy && policy.primary_ph_measure}</strong>
            </p>
            <h3>Policy Subcategory</h3>
            <p>
              <strong>{policy && policy.ph_measure_details}</strong>
            </p>
            <h3>
              Policy{" "}
              {policyTargetList && policyTargetList.length > 1
                ? "Targets"
                : "Target"}
            </h3>
            {policyTargetList &&
              policyTargetList.map(target => (
                <p key={target}>
                  <strong>{target}</strong>
                </p>
              ))}
          </div>
        </div>
      </section>

      <section className={styles.policyDetails}>
        <h2>Location and Officials</h2>
        <div className={styles.row}>
          <div className={styles.leftCol}>
            <div className={styles.row}>
              <div className={styles.col}>
                <h3>Level of Government</h3>
                <p>
                  <strong>{policyPlace && policyPlace.level}</strong>
                </p>
                <h3>Authorized By</h3>
                <p>
                  <strong>{policy && policy.auth_entity[0].office}</strong>
                </p>
              </div>
              <div className={styles.col}>
                <h3>Affected Location</h3>
                <p>
                  <strong>{policyPlace && policyPlace.loc}</strong>
                </p>
                <h3>Affected Location</h3>
                <p>
                  <strong>{policy && policy.auth_entity[0].official}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.rightCol}>
            {iso3 === "USA" && (
              <div className={styles.dillonsRule}>
                <h3>Home Rule</h3>
                <p>
                  <strong>{policyPlace && policyPlace.home_rule}</strong>
                </p>
                <h3>Dillon's Rule</h3>
                <p>
                  <strong>
                    {policy && policy.auth_entity[0].place.dillons_rule}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.policyDetails}>
        <h2>Caseload and Policy Timeline</h2>
        <CaseloadAndPolicies {...{ policy, policyObjectPath, policyID }} />
      </section>

      <section className={styles.relatedPolicies}>
        <h2>Other Policies in this Document</h2>
        <OthersInDocument path={policyObjectPath} policy={policy} />
      </section>

      <section className={styles.relatedPolicies}>
        <h2>Explore Related policies</h2>
        <RelatedPolicies path={policyObjectPath} policy={policy} />
      </section>

      {/* <h2>Target</h2> */}
      {/* <p>{policy && policy.subtarget}</p> */}

      {/*       <h2>Description</h2> */}
      {/*       <p>{policy && policy.desc}</p> */}
      {/*  */}
      {/*       <section className={styles.metadata}> */}
      {/*         <div className={styles.leftCol}> */}
      {/*           <h2>Authority</h2> */}
      {/*           <h3>Office</h3> */}
      {/*           <p>{policy && policy.auth_entity && policy.auth_entity[0].office}</p> */}
      {/*           <h3>Official</h3> */}
      {/*           <p> */}
      {/*             {policy && policy.auth_entity && policy.auth_entity[0].official} */}
      {/*           </p> */}
      {/*         </div> */}
      {/*         <div className={styles.rightCol}> */}
      {/*           <h2>Government</h2> */}
      {/*           <p> */}
      {/*             {policyPlace && */}
      {/*               (policyPlace.level === "Local" */}
      {/*                 ? policyPlace.area2 */}
      {/*                 : policyPlace.area1)} */}
      {/*           </p> */}
      {/*         </div> */}
      {/*       </section> */}
      {/*  */}
      {/*       <h3>Policy Dates for plot</h3> */}
      {/*       {relatedPolicies && */}
      {/*         Object.values(relatedPolicies).map((policy, index) => ( */}
      {/*           <p key={index}> */}
      {/*             {policy && policy.date_start_effective},{" "} */}
      {/*             {policy && policy.date_end_actual} */}
      {/*           </p> */}
      {/*         ))} */}
      {/*       <h3>Related policies</h3> */}
      {/*       <div className={styles.relatedScroller}> */}
      {/*         {relatedPolicies && */}
      {/*           Object.entries(relatedPolicies).map( */}
      {/*             ([relatedPolicyID, relatedPolicy]) => */}
      {/*               relatedPolicyID.replace("ID", "") !== policyID && ( */}
      {/*                 <div */}
      {/*                   key={relatedPolicyID} */}
      {/*                   className={styles.policySummaryWidth} */}
      {/*                 > */}
      {/*                   <PolicySummary */}
      {/*                     location={{ iso3, state }} */}
      {/*                     key={relatedPolicyID} */}
      {/*                     id={relatedPolicyID.replace("ID", "")} */}
      {/*                     policy={relatedPolicy} */}
      {/*                     wordLimit={15} */}
      {/*                   /> */}
      {/*                 </div> */}
      {/*               ) */}
      {/*           )} */}
      {/*       </div> */}
    </article>
  );
};

export default PolicyPage;
