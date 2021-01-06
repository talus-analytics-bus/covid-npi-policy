import React from "react";
import { useLocation } from "react-router-dom";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

import styles from "./IntroSection.module.scss";

const IntroSection = props => {
  const location = useLocation();
  const [state] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-1);

  const policyContextConsumer = React.useContext(policyContext);

  const {
    policyObject,
    policyStatus,
    caseload,
    status,
    locationName,
  } = policyContextConsumer;

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
    <div className={styles.introSection}>
      <h1>{locationName} COVID-19 Policies</h1>
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
              {sevenDayChangePCT > 0 ? "Increase" : "Decrease"} Over Past 7 Days
            </div>
          </>
        )}
      </div>
      {status.policies === "error" && (
        <p>
          COVID-AMP is not currently tracking any policies in {locationName}.
          More policies are being added all the time, check back soon!
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
              {policyStatusName} policy status since {policyStatusDate}, based
              on analysis of{" "}
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
  );
};

export default IntroSection;
