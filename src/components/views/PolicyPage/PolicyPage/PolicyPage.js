import React from "react";

import BlueExpandBox from "../BlueExpandBox/BlueExpandBox";

import styles from "./PolicyPage.module.scss";

// local utility functions
import {
  Policy, // requests policy data
  Challenge, // court challenges associated with policies
  Caseload, // ...caseload data
  execute, // executes a set of API requests
} from "../../../misc/Queries";
import ObservationQuery from "../../../misc/ObservationQuery";

const PolicyPage = ({ setLoading, setPage }) => {
  // STATE // -------------------------------------------------------------- //
  // policy number for policies to be displayed on page
  // TODO obtain dynamically based on URL param, pathname, etc.
  // DEBUG expect 4 policy records with `policy_number` = 446762756
  const [policyNumber, setPolicyNumber] = React.useState(446762756);

  // policies that share the policy number associated with this page
  const [policies, setPolicies] = React.useState(null);

  // court challenges associated with those policies
  const [challenges, setChallenges] = React.useState(null);

  // caseload time series for country or state associated with policy
  const [caseload, setCaseload] = React.useState(null);

  // name of country affected by policy
  // TODO obtain dynamically based on policies or other method
  const [countryName, setCountryName] = React.useState(
    "United States of America"
  );

  // name of state / province affected by policy
  // TODO obtain dynamically based on policies or other method
  const [stateName, setStateName] = React.useState("Texas");

  // EFFECT HOOKS // ------------------------------------------------------- //
  // on init render, set loading to false and page to `policy`
  // and get data for policy
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  React.useEffect(() => {
    getData({
      policyNumber, // the policy number that unites policy records
      countryName, // the name of the country to get caseload data for
      stateName, // the name of the state / province to get caseload data for
      setPolicies, // state setter for policy data
      setChallenges, // state setter for challenges data
      setCaseload, // state setter for caseload data
    });
  }, [countryName, policyNumber, stateName]);

  // JSX // ---------------------------------------------------------------- //
  return (
    <div className={styles.main}>
      <header className={styles.titleHeader}>
        <h1>
          PROCLAMATION BY THE GOVERNOR 20-25.4; SAFE START WASHINGTON MAY 31
          VERSION
        </h1>
      </header>
      <section className={styles.metadata}>
        <div className={styles.leftCol}>
          <h2>Government</h2>
          <p>[county] [state] [country]</p>
          <h2>Authority</h2>
          <h3>Office</h3>
          <p>[Office]</p>
          <h3>Official</h3>
          <p>[Official]</p>
          <h2>State Structure</h2>
          <div className={styles.cols}>
            <div className={styles.col}>
              <h3>Home Rule</h3>
              <p>[Home Rule]</p>
            </div>
            <div className={styles.col}>
              <h3>Dillon's Rule</h3>
              <p>[Home Rule]</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.policySection}>
        <BlueExpandBox>
          <header className={styles.policySectionHeader}>
            <h1>[Date]</h1>
            <h2>[Sections Count]</h2>
            <a href="/downloadFile" className={styles.downloadButton}>
              Download (pdf)
            </a>
          </header>
          <p>lorem ipsum</p>
        </BlueExpandBox>
      </section>
    </div>
  );
};

// FUNCTIONS // ---------------------------------------------------------- //
/**
 * Get data for this page, driven by the policy number chosen, including all
 * policies associated with that policy number, and the follow data that
 * are not yet implemented: court cases, time series for COVID cases.
 * @method getData
 */
const getData = async ({
  policyNumber, // the policy number that unites policy records
  countryName, // the name of the country to get caseload data for
  stateName, // the name of the state / province to get caseload data for
  setPolicies, // state setter for policy data
  setChallenges, // state setter for challenges data
  setCaseload, // state setter for caseload data
}) => {
  // define queries
  const queries = {};

  // policy data
  queries.policy = Policy({
    method: "post",
    filters: { policy_number: [policyNumber] },
    fields: [
      "id",
      "place",
      "auth_entity",
      "primary_ph_measure",
      "authority_name",
      "name_and_desc",
      "date_start_effective",
      "file",
    ],
  });

  // court cases which refer to the policy number
  queries.challenge = Challenge({
    method: "post",
    filters: { "policy.policy_number": [policyNumber] },
    // fields: [], // TODO include only needed fields in response
  });

  // time series for COVID cases for a given state (in US) or
  // country (global)
  queries.caseload = Caseload({
    countryName,
    stateName, // leave undefined if country-level data required
  });

  // get results
  const results = await execute({ queries });

  // set state based on results
  setPolicies(results.policy.data);
  setCaseload(results.caseload);
  setChallenges(results.challenge.data);
};

export default PolicyPage;
