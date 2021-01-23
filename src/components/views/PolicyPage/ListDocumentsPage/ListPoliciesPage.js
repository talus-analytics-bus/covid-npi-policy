import React from "react";
import { useLocation } from "react-router-dom";

import { Caseload } from "../../../misc/Queries";

import { PolicyList } from "../../../misc/Queries";
import CaseloadPlot from "../CaseloadPlot/CaseloadPlot";
import * as MiniMap from "../MiniMap/MiniMap";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const location = useLocation();
  const [iso3] = React.useState(
    location.pathname.replace(/\/$/, "").split("/")[2]
  );
  const [state] = React.useState(
    location.pathname.replace(/\/$/, "").split("/")[3]
  );

  const [policyList, setPolicyList] = React.useState();

  React.useEffect(() => {
    const getPolicyList = async () => {
      const data = await PolicyList({
        method: "post",
        filters: {
          iso3: [iso3],
          area1: [state],
        },
        ordering: [["earliest_date_start_effective", "desc"]],
      });

      console.log(data.data);
      setPolicyList(data.data);
    };

    getPolicyList();
  }, [iso3, state]);

  const stateForAPI = state === "Unspecified" ? undefined : state;

  const { policyPageCaseload, setPolicyPageCaseload } = props;

  React.useEffect(() => {
    const getCaseload = async () => {
      console.log(`MAKE REQUEST: ${iso3}, ${stateForAPI}`);
      const response = await Caseload({
        countryIso3: iso3,
        stateName: stateForAPI, // leave undefined if country-level data required
      });

      setPolicyPageCaseload({
        ...policyPageCaseload,
        [iso3]: {
          [stateForAPI || "national"]: response.map(point => ({
            x: Date.parse(point.date_time),
            y: point.value,
          })),
        },
      });
    };

    if (iso3) {
      if (!Object.keys(policyPageCaseload).includes(iso3)) {
        getCaseload();
      }
      if (Object.keys(policyPageCaseload).includes(iso3)) {
        if (!policyPageCaseload[iso3][stateForAPI || "national"]) {
          getCaseload();
        }
      }
    }
  }, [iso3, stateForAPI, policyPageCaseload, setPolicyPageCaseload]);

  const primaryMeasures = policyList && [
    ...new Set(
      policyList
        .map(policyNumber =>
          policyNumber.policies.map(policy => policy.primary_ph_measure)
        )
        .flat()
    ),
  ];

  const totalPolicyCount =
    policyList &&
    policyList.reduce(
      (sum, policyNumber) => policyNumber.policies.length + sum,
      0
    );

  const sevenDayCases =
    policyPageCaseload[iso3] &&
    policyPageCaseload[iso3][stateForAPI || "national"] &&
    policyPageCaseload[iso3][stateForAPI || "national"].slice(-1)[0].y;

  console.log(sevenDayCases);

  return (
    <MiniMap.Provider scope={state ? "USA" : "world"}>
      <section className={styles.introSection}>
        <div className={styles.text}>
          <h1>{state ? state : iso3} COVID-19 Policies</h1>
          <div className={styles.quickFacts}>
            <div className={styles.policies}>
              {policyList && policyList.length}
              <br /> Policies
            </div>
            <div className={styles.status}>
              New Normal
              <br />
              Policy Status
            </div>
            <div className={styles.status}>
              {sevenDayCases}
              <br /> 7-Day Cases
            </div>
            <div className={styles.status}>
              2% higher than
              <br /> previous week
            </div>
          </div>
          <p>
            {state ? state : iso3} has been in a {`New Normal`} policy status
            for the past {`two months`}, based on analysis of{" "}
            {totalPolicyCount && totalPolicyCount} measures from{" "}
            {policyList && policyList.length}{" "}
            {state ? "state and county" : "national"} policies covering{" "}
            {primaryMeasures &&
              primaryMeasures
                .map(pm => pm.toLowerCase())
                .slice(0, -1)
                .join(", ")}
            , and{" "}
            {primaryMeasures &&
              primaryMeasures
                .slice(-1)
                .join("")
                .toLowerCase()}
            .
          </p>
        </div>
        <div className={styles.miniMapHolder}>
          <MiniMap.SVG
            country={iso3}
            state={state}
            counties={["Unspecified"]}
          />
        </div>
      </section>
      <section className={styles.caseloadContainer}>
        <CaseloadPlot
          policyPageCaseload={props.policyPageCaseload}
          setPolicyPageCaseload={props.setPolicyPageCaseload}
          country={iso3}
          state={state}
        />
      </section>
      <section className={styles.policyList}>
        <h1>List policies for {state ? state : iso3}</h1>

        {policyList &&
          policyList.map(policyNumber => (
            <section key={policyNumber.policy_number}>
              <div>
                <h1>
                  {policyNumber.policies[0].date_start_effective}{" "}
                  {policyNumber.titles[0]}
                </h1>
                <h2>Authority: {policyNumber.auth_entity_offices[0]}</h2>
              </div>
              <p>Policy number: {policyNumber.policy_number}</p>
              <p>
                {[
                  ...new Set(
                    policyNumber.policies.map(
                      policy => policy.ph_measure_details
                    )
                  ),
                ].join(", ")}
              </p>
              <a href={`/policy/${policyNumber.policy_number}/`}>
                Explore policy
              </a>
            </section>
          ))}
      </section>
    </MiniMap.Provider>
  );
};

export default ListPoliciesPage;
