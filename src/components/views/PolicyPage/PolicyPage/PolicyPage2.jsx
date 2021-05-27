import React from "react";
import { Link, useLocation } from "react-router-dom";

import { loadFullPolicy } from "../PolicyRouter/PolicyLoaders";

import { getFirstPathFromObject, getObjectByPath } from "../objectPathTools";

// import * as MiniMap from "../MiniMap/MiniMap";
import PolicyCategoryIcon from "../PolicyCategoryIcon/PolicyCategoryIcon";
import OthersInDocument from "./OthersInDocument/OthersInDocument";
import RelatedPolicies from "./RelatedPolicies/RelatedPolicies";
import CourtChallenges from "./CourtChallenges/CourtChallenges";

import PolicyBreadcrumbs from "./PolicyBreadcrumbs/PolicyBreadcrumbs";
import MapFigure from "./MapFigure/MapFigure";
import HomeRuleDillonsRule from "./HomeRuleDillonsRule/HomeRuleDillonsRule";
import PolicyTitle from "./PolicyTitle/PolicyTitle";
import PolicyDates from "./PolicyDates/PolicyDates";
import PolicyDetails from "./PolicyDetails/PolicyDetails";
import LocationAndOfficials from "./LocationAndOfficials/LocationAndOfficials";

// import CaseloadAndPolicies from "./CaseloadAndPolicies/CaseloadAndPolicies";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./PolicyPage2.module.scss";

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
  console.log(policy);

  // debugger;

  return (
    <article className={styles.policyPage}>
      <header>
        <h1>Policy details</h1>
        <PolicyBreadcrumbs {...{ iso3, state, policyObjectPath }} />
      </header>
      <main className={styles.mainSection}>
        <div className={styles.left}>
          <PolicyTitle {...{ policy }} />
          <PolicyDates {...{ policy }} />
          <PolicyDetails {...{ policy }} />
          <LocationAndOfficials {...{ policy, policyPlace }} />
        </div>
        <div className={styles.right}>
          <MapFigure {...{ policy, state }} />
          {iso3 === "USA" && (
            <HomeRuleDillonsRule {...{ policyPlace, policy }} />
          )}
        </div>
      </main>
      <RelatedPolicies path={policyObjectPath} policy={policy} />
    </article>
  );
};

export default PolicyPage;
