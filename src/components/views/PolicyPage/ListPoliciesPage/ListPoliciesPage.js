import React from "react";
import { useParams } from "react-router-dom";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
} from "../PolicyRouter/PolicyLoaders";

import CaseloadPlot from "../CaseloadPlotD3/CaseloadPlot";
import PolicyList from "./PolicyList/PolicyList";

import { MiniMap } from "../MiniMap/MiniMap";

import { policyContext } from "../PolicyRouter/PolicyRouter";

import styles from "./ListPoliciesPage.module.scss";

const ListPoliciesPage = props => {
  const { iso3, state } = useParams();

  const policyContextConsumer = React.useContext(policyContext);
  // unpacking this so the hook dependency
  // will work correctly
  const {
    policyObject,
    setPolicyObject,
    policyStatus,
    caseload,
    error,
    setError,
  } = policyContextConsumer;

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards

    if (!error.policies && Object.keys(policyObject).length < 2) {
      const filters = { iso3: [iso3] };
      if (state !== "national") {
        filters["area1"] = [state];
      }

      console.log("request policy list");

      loadPolicyCategories({
        filters,
        stateSetter: setPolicyObject,
        setError,
      });
      loadPolicySubCategories({
        filters,
        stateSetter: setPolicyObject,
        setError,
      });
    }
  }, [iso3, state, policyObject, setPolicyObject, error, setError]);

  const [scrollPos] = policyContextConsumer.policyListScrollPos;

  React.useLayoutEffect(() => {
    window.scroll(0, scrollPos);
  }, [scrollPos]);

  // if this array is re-created it will make the minimap
  // re-render so we only want to create it when this component mounts
  const miniMapCounties = React.useRef(["Unspecified"]);

  const policyCount = Object.values(policyObject).reduce(
    (acc, cur) => ({
      count: cur.count + acc.count,
      active: cur.active + acc.active,
    }),
    { count: 0, active: 0 }
  );

  console.log(policyStatus);
  const policyStatusDate =
    policyStatus &&
    policyStatus[0] &&
    new Date(policyStatus[0].datestamp).toLocaleString("en-us", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const policyStatusName =
    policyStatusDate && policyStatus[0].value.toLowerCase();

  const sevenDaySum =
    caseload && caseload.slice(-8, -1).reduce((sum, day) => day.value + sum, 0);

  const lastSevenDaySum =
    caseload &&
    caseload.slice(-15, -8).reduce((sum, day) => day.value + sum, 0);

  const sevenDayChangePCT = Math.round(
    ((sevenDaySum - lastSevenDaySum) / lastSevenDaySum) * 100
  );

  const locationName = state !== "national" ? state : iso3;

  return (
    <article>
      <section className={styles.introSection}>
        <div className={styles.text}>
          <h1>{state !== "national" ? state : iso3} COVID-19 Policies</h1>
          <div className={styles.quickFacts}>
            {error.policies ? (
              <div className={styles.policies}>
                No Policies Found in {locationName}
              </div>
            ) : (
              <>
                <div className={styles.policies}>
                  <strong>{policyCount.count}</strong> Total Policies
                </div>
                <div className={styles.status}>
                  <strong>{policyCount.active}</strong> Active policies
                </div>
              </>
            )}
          </div>
          <div className={styles.quickFacts}>
            <div className={styles.status}>
              <strong>{sevenDaySum}</strong> New Cases in Past 7 Days
            </div>
            <div className={styles.status}>
              <strong>{Math.abs(sevenDayChangePCT)}% </strong>
              {sevenDayChangePCT > 0 ? "Increase" : "Decrease"} Over Past 7 Days
            </div>
          </div>
          {error.policies ? (
            <p>
              COVID-AMP is not currently tracking any policies in {locationName}
              . More policies are being added all the time, check back soon!
            </p>
          ) : (
            <p>
              {locationName} has been in a {policyStatusName} policy status
              since {policyStatusDate}, based on analysis of{" "}
              {policyCount.active} active{" "}
              {state !== "national" ? "state and county" : "national and local"}{" "}
              policies covering{" "}
              {Object.keys(policyObject)
                .map(pm => pm.toLowerCase())
                .slice(0, -1)
                .join(", ")}
              , and{" "}
              {Object.keys(policyObject)
                .slice(-1)
                .join("")
                .toLowerCase()}
              .
            </p>
          )}
        </div>
        <div className={styles.miniMapHolder}>
          <MiniMap.SVG
            country={iso3}
            state={state}
            counties={miniMapCounties.current}
          />
        </div>
      </section>
      <section className={styles.caseloadPlot}>
        <h2>Cases in {locationName}</h2>
        <CaseloadPlot />
      </section>
      <section className={styles.policyList}>
        {error.policies ? (
          <h3>No Policies Found in {locationName}</h3>
        ) : (
          <>
            <h2>Policies in {locationName}</h2>
            <PolicyList />
          </>
        )}
      </section>
    </article>
  );
};

export default ListPoliciesPage;
