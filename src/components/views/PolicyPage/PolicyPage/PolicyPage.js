import React from "react";
import { useLocation } from "react-router-dom";

import PolicyDateSection from "./PolicyDateSection/PolicyDateSection";

import styles from "./PolicyPage.module.scss";

// local utility functions
import {
  Policy, // requests policy data
  Challenge, // court challenges associated with policies
  Caseload, // ...caseload data
  execute, // executes a set of API requests
} from "../../../misc/Queries";
import ObservationQuery from "../../../misc/ObservationQuery";

const PolicyPage = ({ setPage, setLoading }, props) => {
  // STATE // -------------------------------------------------------------- //
  // policy number for policies to be displayed on page
  // TODO obtain dynamically based on URL param, pathname, etc.
  // DEBUG expect 4 policy records with `policy_number` = 446762756
  const location = useLocation();

  // const [policyNumber,] = React.useState(446762756);
  // const [policyNumber] = React.useState(policyFromURL);

  // policies that share the policy number associated with this page
  const [firstPolicy, setFirstPolicy] = React.useState(null);
  const [policiesByDate, setPoliciesByDate] = React.useState(null);

  // court challenges associated with those policies
  const [challenges, setChallenges] = React.useState(null);

  // caseload time series for country or state associated with policy
  const [caseload, setCaseload] = React.useState(null);

  // name of country affected by policy
  // TODO obtain dynamically based on policies or other method
  const [countryIso3, setCountryIso3] = React.useState("USA");

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

  // Request Policies when policyNumber changes
  React.useEffect(() => {
    const getPolicies = async () => {
      const policyNumber = Number(
        location.pathname.replace(/[a-z]*\/|\//g, "")
      );

      const { data } = await Policy({
        method: "post",
        filters: { policy_number: [policyNumber] },
        fields: [
          "id",
          "policy_name",
          "auth_entity",
          "date_start_effective",
          "file",
        ],
      });

      const groupByDate = {};
      data.forEach(policy => {
        groupByDate[policy.date_start_effective] = groupByDate[
          policy.date_start_effective
        ]
          ? [...groupByDate[policy.date_start_effective], policy]
          : [policy];
      });

      setFirstPolicy(data[0]);
      setPoliciesByDate(groupByDate);
    };
    getPolicies();
  }, [location.pathname]);

  const auth_entity = firstPolicy && firstPolicy.auth_entity[0];

  // React.useEffect(() => {
  //   getData({
  //     policyNumber, // the policy number that unites policy records
  //     countryIso3, // the name of the country to get caseload data for
  //     stateName, // the name of the state / province to get caseload data for
  //     setPolicies, // state setter for policy data
  //     setChallenges, // state setter for challenges data
  //     setCaseload, // state setter for caseload data
  //   });
  // }, [countryIso3, policyNumber, stateName]);

  // JSX // ---------------------------------------------------------------- //
  console.log(firstPolicy);
  console.log(policiesByDate);

  return (
    <div className={styles.main}>
      <header className={styles.titleHeader}>
        <h1>{firstPolicy && firstPolicy.policy_name}</h1>
      </header>
      <section className={styles.metadata}>
        <div className={styles.leftCol}>
          <h2>Government</h2>
          <p>{auth_entity && auth_entity.place.loc}</p>
          <h2>Authority</h2>
          <h3>Office</h3>
          <p>{auth_entity && auth_entity.office}</p>
          <h3>Official</h3>
          <p>
            {auth_entity && auth_entity.official && auth_entity.official + ", "}
            {auth_entity && auth_entity.name}
          </p>
          <h2>State Structure</h2>
          <div className={styles.cols}>
            <div className={styles.col}>
              <h3>Home Rule</h3>
              <p>{auth_entity && auth_entity.place.home_rule}</p>
            </div>
            <div className={styles.col}>
              <h3>Dillon's Rule</h3>
              <p>{auth_entity && auth_entity.place.dillons_rule}</p>
            </div>
          </div>
        </div>
      </section>
      {policiesByDate &&
        Object.entries(policiesByDate).map(([date, policies]) => (
          <PolicyDateSection
            key={date}
            date={date}
            policies={policies}
            open={Object.keys(policiesByDate).length === 1}
          >
            <p>Lorem ipsum</p>
            <p>Lorem ipsum</p>
          </PolicyDateSection>
        ))}
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
  countryIso3, // the name of the country to get caseload data for
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
    countryIso3,
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
