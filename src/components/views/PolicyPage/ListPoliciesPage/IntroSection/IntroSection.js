import React from "react";
import { useLocation } from "react-router-dom";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

import policyPageDocumentIcon from "../../../../../assets/icons/policyPageDocumentIcon.svg";
import policyPageDocumentIconActive from "../../../../../assets/icons/policyPageDocumentIconActive.svg";
import newCasesIcon from "../../../../../assets/icons/newCasesIcon.svg";

import styles from "./IntroSection.module.scss";

const numberFormat = new Intl.NumberFormat("en-us");

const numbersToWords = number =>
  ({
    0: "none",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
  }[number] || numberFormat.format(number));

const IntroSection = props => {
  const location = useLocation();
  const [iso3, state] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-2);

  const policyContextConsumer = React.useContext(policyContext);

  const {
    policySummaryObject,
    policyStatus,
    caseload,
    status,
    locationName,
  } = policyContextConsumer;

  const policyCount = Object.values(policySummaryObject).reduce(
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
    lastSevenDaySum &&
    Math.round(((sevenDaySum - lastSevenDaySum) / lastSevenDaySum) * 100);

  const policyCategoriesText =
    Object.keys(policySummaryObject).length === 1
      ? Object.keys(policySummaryObject)
          .join("")
          .toLowerCase()
      : Object.keys(policySummaryObject)
          .map(pm => pm.toLowerCase())
          .slice(0, -1)
          .join(", ") +
        " and " +
        Object.keys(policySummaryObject)
          .slice(-1)
          .join("")
          .toLowerCase();

  if (iso3 === "Unspecified") {
    return (
      <div className={styles.introSection}>
        <h1>{locationName} COVID-19 Policies</h1>
      </div>
    );
  }

  return (
    <div className={styles.introSection}>
      {locationName !== iso3 ? (
        <h1>{locationName} COVID-19 Policies</h1>
      ) : (
        <h1>&nbsp;</h1>
      )}
      {status.policiesSummary === "error" && (
        <>
          <p className={styles.introParagraph}>
            COVID-AMP is not currently tracking any policies affecting{" "}
            {locationName}. More policies are being added all the time, check
            back soon!
          </p>
        </>
      )}
      {status.policiesSummary === "loading" && (
        <p className={styles.introParagraph}>
          Loading policies for {locationName}
        </p>
      )}
      {status.policiesSummary === "loaded" && (
        <p className={styles.introParagraph}>
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
          {numbersToWords(policyCount.active)} active{" "}
          {policyCount.active > 1 &&
            (state !== "national"
              ? "state and county"
              : "national and local")}{" "}
          {Object.keys(policySummaryObject).length > 1 ? "policies" : "policy"}{" "}
          affecting {policyCategoriesText}
          {(status.policyStatus === "error" ||
            status.policyStatus === "loading") && (
            <> in {locationName.trim()}</>
          )}
          .
        </p>
      )}
    </div>
  );
};

export default IntroSection;
