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
    status,
    setStatus,
  } = policyContextConsumer;

  // Get category and subcategory
  // for all policies when component mounts
  React.useEffect(() => {
    // don't re-request if policies are already
    // loaded like when the user navigates backwards

    if (status.policies === "initial") {
      const filters = { iso3: [iso3] };
      if (state !== "national") {
        filters["area1"] = [state];
      }

      console.log("request policy list");

      setStatus(prev => ({ ...prev, policies: "loading" }));

      loadPolicyCategories({
        filters,
        stateSetter: setPolicyObject,
        setStatus,
      });
      loadPolicySubCategories({
        filters,
        stateSetter: setPolicyObject,
        setStatus,
      });
    }
  }, [iso3, state, policyObject, setPolicyObject, status, setStatus]);

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

  const policyStatusDate =
    status.policyStatus === "loaded" &&
    new Date(policyStatus[0].datestamp).toLocaleString("en-us", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const policyStatusName =
    status.policyStatus === "loaded" && policyStatus[0].value.toLowerCase();

  const sevenDaySum =
    status.caseload === "loaded" &&
    caseload.slice(-8, -1).reduce((sum, day) => day.value + sum, 0);

  const lastSevenDaySum =
    status.caseload === "loaded" &&
    caseload.slice(-15, -8).reduce((sum, day) => day.value + sum, 0);

  const sevenDayChangePCT =
    status.policies === "loaded" &&
    Math.round(((sevenDaySum - lastSevenDaySum) / lastSevenDaySum) * 100);

  const locationName = state !== "national" ? state : iso3;

  const policyCategoriesText =
    Object.keys(policyObject) === 1
      ? Object.keys(policyObject).join("")
      : Object.keys(policyObject)
          .map(pm => pm.toLowerCase())
          .slice(0, -1)
          .join(", ") +
        " and " +
        Object.keys(policyObject)
          .slice(-1)
          .join("")
          .toLowerCase();

  return (
    <article>
      <section className={styles.introSection}>
        <div className={styles.text}>
          <h1>{state !== "national" ? state : iso3} COVID-19 Policies</h1>
          <div className={styles.quickFacts}>
            {status.policies === "loading" && (
              <div className={styles.policies}>
                Loading policies for {locationName}
              </div>
            )}
            {status.policies === "error" && (
              <div className={styles.policies}>
                No Policies Found in {locationName}
              </div>
            )}
            {status.policies === "loaded" && (
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
            {status.caseload === "loading" && (
              <div className={styles.policies}>
                Loading casload for {locationName}
              </div>
            )}
            {status.caseload === "error" && (
              <div className={styles.policies}>
                No Caseload Found in {locationName}
              </div>
            )}
            {status.caseload === "loaded" && (
              <>
                <div className={styles.status}>
                  <strong>{sevenDaySum}</strong> New Cases in Past 7 Days
                </div>
                <div className={styles.status}>
                  <strong>{Math.abs(sevenDayChangePCT)}% </strong>
                  {sevenDayChangePCT > 0 ? "Increase" : "Decrease"} Over Past 7
                  Days
                </div>
              </>
            )}
          </div>
          {status.policies === "error" && (
            <p>
              COVID-AMP is not currently tracking any policies in {locationName}
              . More policies are being added all the time, check back soon!
            </p>
          )}
          {status.policies === "loading" && (
            <p>Loading policies for {locationName}</p>
          )}
          {status.policies === "loaded" && (
            <p>
              {status.policyStatus === "loaded" && (
                <>
                  {locationName} has been in{" "}
                  {/[aeiou]/.test(policyStatusName[0]) ? "an " : "a "}
                  {policyStatusName} policy status since {policyStatusDate},
                  based on analysis of{" "}
                </>
              )}
              {(status.policyStatus === "error" ||
                status.policyStatus === "loading") && (
                <>COVID-AMP is currently tracking </>
              )}
              {policyCount.active} active{" "}
              {state !== "national" ? "state and county" : "national and local"}{" "}
              {Object.keys(policyObject).length > 1 ? "policies" : "policy"}{" "}
              covering {policyCategoriesText}
              {(status.policyStatus === "error" ||
                status.policyStatus === "loading") && <> in {locationName}</>}
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
        {status.caseload === "error" && (
          <h3>No caseload data found for {locationName}</h3>
        )}
        {(status.caseload === "loading" || status.caseload === "loaded") && (
          <>
            <h2>Cases in {locationName}</h2>
            <CaseloadPlot />
          </>
        )}
      </section>
      <section className={styles.policyList}>
        {status.policies === "loading" && (
          <h3>Loading policies for {locationName}</h3>
        )}
        {status.policies === "error" && (
          <h3>No Policies Found in {locationName}</h3>
        )}

        {status.policies === "loaded" && (
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
