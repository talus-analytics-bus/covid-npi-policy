import React, { useEffect } from "react";
// import { useLocation } from "react-router-dom";

import { useRecoilState } from "recoil";

import SnapshotChart from "./SnapshotChart";

import styles from "./SnapshotChartSection.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

// import { introDateState } from "../PolicyEnvironmentPlot/Slider/Slider";

const SnapshotChartSection = () => {
  // const location = useLocation();
  // const [iso3, state] = location.pathname
  //   .replace(/\/$/, "")
  //   .split("/")
  //   .slice(-2);

  const { policySummaryObject } = React.useContext(policyContext);

  // const [introDate, setIntroDate] = useRecoilState(introDateState);

  // useEffect(() => {
  //   if (policySummaryObject) {
  //     const dates = Object.keys(policySummaryObject);
  //     setIntroDate(dates[dates.length - 1]);
  //   }
  // }, [policySummaryObject]);

  // const policyScope =
  //   state !== "national" ? "state and county" : "national and local";

  // const policyCount =
  //   policySummaryObject[introDate] &&
  //   Object.values(policySummaryObject[introDate]).reduce(
  //     (acc, cur) => ({
  //       count: cur.count + acc.count,
  //       active: cur.active + acc.active,
  //     }),
  //     { count: 0, active: 0 }
  //   );

  const lastStatus =
    policySummaryObject &&
    policySummaryObject[
      Object.keys(policySummaryObject)[
        Object.keys(policySummaryObject).length - 1
      ]
    ];

  const categories =
    lastStatus &&
    Object.keys(lastStatus.expired).sort((a, b) => a.localeCompare(b));

  return (
    <div className={styles.sectionContainer}>
      {/* <h2 className={styles.header2}>Policy snapshot</h2> */}
      {/* <span className={styles.asOfDate}>As of TODO DATE</span> */}
      <div className={styles.labels}>
        <h3>Policy category</h3>
        {lastStatus &&
          categories.map(category => <p key={category}>{category}</p>)}
      </div>
      <div className={styles.chartContainer}>
        <h3>Number of policies</h3>
        <SnapshotChart {...{ policySummaryObject }} />
        {/* <div className={styles.legend}>
          {policySummaryObject && (
            <>
              <div className={styles.entry}>
                <div
                  className={styles.active}
                  style={{ background: "#409384" }}
                />
                <span>
                  <strong>{policyCount.active}</strong> active {policyScope}{" "}
                  policies as of TODO DATE
                </span>
              </div>
              <div className={styles.entry}>
                <div
                  className={styles.total}
                  style={{ background: "#96C4BB" }}
                />
                <span>
                  <strong>{policyCount.count}</strong> total {policyScope}{" "}
                  policies as of TODO DATE
                </span>
              </div>
            </>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default SnapshotChartSection;
