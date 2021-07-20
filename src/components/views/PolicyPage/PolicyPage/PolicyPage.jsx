import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

import { loadFullPolicy } from "../PolicyRouter/PolicyLoaders";

import { getFirstPathFromObject, getObjectByPath } from "../objectPathTools";

// import * as MiniMap from "../MiniMap/MiniMap";
import OthersInDocument from "./OthersInDocument/OthersInDocument";
import RelatedPolicies from "./RelatedPolicies/RelatedPolicies";

import PolicyBreadcrumbs from "./PolicyBreadcrumbs/PolicyBreadcrumbs";
import MapFigure from "./MapFigure/MapFigure";
import HomeRuleDillonsRule from "./HomeRuleDillonsRule/HomeRuleDillonsRule";
import PolicyTitle from "./PolicyTitle/PolicyTitle";
import PolicyDates from "./PolicyDates/PolicyDates";
import PolicyDetails from "./PolicyDetails/PolicyDetails";
import LocationAndOfficials from "./LocationAndOfficials/LocationAndOfficials";

// import CaseloadAndPolicies from "./CaseloadAndPolicies/CaseloadAndPolicies";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./PolicyPage.module.scss";
import DocumentPreview from "./DocumentPreview/DocumentPreview";
import ExploreSource from "./ExploreSource/ExploreSource";

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

  const { policyObject, setPolicyObject, locationName } = React.useContext(
    policyContext
  );

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

  // display name for policy
  const policyName = getPolicyDisplayName(policy);
  return (
    <article className={styles.policyPage}>
      <Helmet>
        <title>{policyName}</title>
        <meta name={`Information about policy "${policyName}"`} />
      </Helmet>
      <header>
        <h1>{locationName} policy details</h1>
        <PolicyBreadcrumbs {...{ iso3, state, policyObjectPath }} />
      </header>
      <main className={styles.mainSection}>
        <div className={styles.section}>
          <div className={styles.left}>
            <PolicyTitle {...{ policy }} />
            <PolicyDates {...{ policy }} />
          </div>
          <div className={styles.right}>
            <DocumentPreview />
            <ExploreSource {...{ policy }}>View source document</ExploreSource>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.left}>
            {/* <PolicyDetails {...{ policy }} /> */}
            <h2>POLICY DETAILS</h2>
            <h3>Relevant Authority</h3>
            <p>{policy && policy.authority_name}</p>
            <h3>Description</h3>
            <p>{policy && policy.desc}</p>
          </div>
          <div className={styles.right}>
            <h3>Policy Category</h3>
            <p>{policy && policy.primary_ph_measure}</p>
            <h3>Policy Subcategory</h3>
            <p>{policy && policy.ph_measure_details}</p>
            <h3>
              Policy{" "}
              {policyTargetList && policyTargetList.length > 1
                ? "Targets"
                : "Target"}
            </h3>
            {policyTargetList &&
              policyTargetList.map(target => <p key={target}>{target}</p>)}
          </div>
        </div>
        <div className={styles.section}>
          <LocationAndOfficials {...{ state, policy, policyPlace }} />
        </div>
        {/* <div className={styles.section}> */}
        <OthersInDocument {...{ policy }} path={policyObjectPath} />
        {/* </div> */}
        {/* <div className={styles.right}>
          {iso3 === "USA" && (
            <HomeRuleDillonsRule {...{ policyPlace, policy }} />
          )}
        </div> */}
      </main>
      <RelatedPolicies path={policyObjectPath} policy={policy} />
    </article>
  );
};

export default PolicyPage;

const NAME_MAX_CHARS = 15;
/**
 * Returns the policy name to use in the title of a policy details page.
 * @param {PolicyRecord} policy The policy
 * @returns {string} The name to use in the page title
 */
function getPolicyDisplayName(policy) {
  if (!policy) return "Policy details";
  const policyName = policy.policy_name;
  const nameIsDefined =
    policy !== undefined &&
    policyName !== undefined &&
    policyName !== null &&
    policyName.trim() !== "";
  if (nameIsDefined) {
    if (policyName.length > NAME_MAX_CHARS) {
      return policyName.slice(0, NAME_MAX_CHARS) + "...";
    } else return policyName;
  } else return "Policy details";
}
