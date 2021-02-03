import React from "react";
import { Link, useLocation } from "react-router-dom";

import { loadFullPolicy } from "../PolicyRouter/PolicyLoaders";

import { getFirstPathFromObject, getObjectByPath } from "../objectPathTools";

import * as MiniMap from "../MiniMap/MiniMap";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";
import OthersInDocument from "./OthersInDocument/OthersInDocument";
import RelatedPolicies from "./RelatedPolicies/RelatedPolicies";
import CourtChallenges from "./CourtChallenges/CourtChallenges";
import ExploreSource from "./ExploreSource/ExploreSource";

import courtChallengeIcon from "../../../../assets/icons/CourtChallengeIcon.svg";

// import CaseloadAndPolicies from "./CaseloadAndPolicies/CaseloadAndPolicies";

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
    loadFullPolicy({
      stateSetter: setPolicyObject,
      filters: {
        id: [Number(policyID)],
        iso3: [iso3],
      },
    });
  }, [policyID, iso3, setPolicyObject]);

  const policyPlace =
    policy && policy.auth_entity && policy.auth_entity[0].place;

  const policyTargetList = policy && policy.subtarget;

  // console.log(policyObjectPath);
  // console.log(policyObject);
  // console.log(policy);

  // debugger;

  return (
    <article className={styles.policyPage}>
      <div className={styles.breadCrumbs}>
        {iso3 !== "Unspecified" && (
          <>
            <PolicyCategoryIcon
              category={policyObjectPath && policyObjectPath[0]}
            />
            <Link to={`/policies/${iso3}/${state}`}>
              {policyObjectPath &&
                policyObjectPath
                  .filter(
                    s =>
                      ![
                        "children",
                        // "Local",
                        // "Country",
                        // "State / Province",
                      ].includes(s)
                  )
                  .slice(0, -2)
                  .map(e => (
                    <React.Fragment key={e}>{e} &nbsp; 〉 </React.Fragment>
                  ))}
              {policyObjectPath && policyObjectPath.slice(-3)[0]}
            </Link>
          </>
        )}
      </div>

      <section className={styles.headerSection}>
        <div className={styles.row}>
          <div className={styles.wideCol}>
            <div className={styles.row}>
              <header>
                <div className={styles.row}>
                  <h1>
                    {policy ? (
                      <>
                        {`${policy.auth_entity[0].place.loc
                          .split(",")[0]
                          .replace(/\([A-Z]*\)/, "")}
                      ${policy.primary_ph_measure}: `}
                        <br />
                        {policy.ph_measure_details}
                        <br /> {policy && "issued "}
                        {policy &&
                          formatDate(new Date(policy.date_start_effective))}
                      </>
                    ) : (
                      <>
                        <br />
                        <br />
                        <br />
                      </>
                    )}
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

            <div className={styles.headerInfoRow}>
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
                    {policy &&
                      (policy.date_issued
                        ? formatDate(new Date(policy.date_issued))
                        : "Not Specified")}
                  </strong>
                </p>
              </div>
              {policy && policy.court_challenges && (
                <div className={styles.col}>
                  <div className={styles.courtChallengeIcon}>
                    <img src={courtChallengeIcon} alt="Court Challenge Icon" />
                    <h3>
                      Challenged <br />
                      In Court
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.rightCol}>
            <div className={styles.miniMapHolder}>
              <figure>
                <MiniMap.SVG
                  country={
                    policy &&
                    policy.place &&
                    policy.place.map(place => place.iso3)
                  }
                  state={state && state}
                  counties={
                    policy
                      ? [policy.auth_entity[0].place.area2.split(" County")[0]]
                      : []
                  }
                />

                {/* {iso3 !== "Unspecified" && ( */}
                {/*   <figcaption> */}
                {/*     Countries, states, provinces or counties affected by this */}
                {/*     policy. */}
                {/*   </figcaption> */}
                {/* )} */}
              </figure>
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
            <p>
              <strong>{policy && policy.desc}</strong>
            </p>
            {policy && policy.policy_name !== "Not Available" && (
              <ExploreSource {...{ policy }} />
            )}
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
                <h3>Authorizing Location</h3>
                <p>
                  <strong>
                    {policyPlace && policyPlace.loc.split(",")[0]}
                  </strong>
                </p>
                <h3>Official</h3>
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

      <CourtChallenges {...{ policy }} />

      {/* <section className={styles.policyDetails}> */}
      {/*   <h2>Caseload and Policy Timeline</h2> */}
      {/*   <CaseloadAndPolicies {...{ policy, policyObjectPath, policyID }} /> */}
      {/* </section> */}

      <OthersInDocument path={policyObjectPath} policy={policy} />

      <RelatedPolicies path={policyObjectPath} policy={policy} />
    </article>
  );
};

export default PolicyPage;
