import React from "react";

import BlueExpandBox from "../BlueExpandBox/BlueExpandBox";

import styles from "./PolicyPage.module.scss";

// local utility functions
import { Policy, execute } from "../../../misc/Queries"; // requests policy data

const PolicyPage = ({ setLoading, setPage }) => {
  // STATE // -------------------------------------------------------------- //
  // policy number for policies to be displayed on page
  // TODO set dynamically based on URL param, pathname, etc.
  // DEBUG expect 5 policy records with `policy_number` = 298882742
  const [policyNumber, setPolicyNumber] = React.useState(298882742);

  // policies that share the policy number associated with this page
  const [policies, setPolicies] = React.useState([]);

  // FUNCTIONS // ---------------------------------------------------------- //
  /**
   * Get data for this page, driven by the policy number chosen, including all
   * policies associated with that policy number, and the follow data that
   * are not yet implemented: court cases, time series for COVID cases.
   * @method getData
   */
  const getData = async () => {
    // define queries
    const queries = {};

    // policy data
    queries.policy = Policy({
      method: "post",
      filters: { policy_number: [policyNumber] },
    });

    // court cases which refer to the policy number
    // TODO

    // time series for COVID cases for a given state (in US) or
    // country (global)
    // TODO

    // get results
    const results = await execute({ queries });

    // set state based on results
    setPolicies(results.policy.data);
  };

  // EFFECT HOOKS // ------------------------------------------------------- //
  // on init render, set loading to false and page to `policy`
  // and get data for policy
  React.useEffect(() => {
    setLoading(false);
    setPage("policy");

    // retrieve policy data
    // TODO ensure this occurs every time policy number is changed
    getData();
  }, [getData, setLoading, setPage]);

  React.useEffect(() => {}, []);

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

export default PolicyPage;
