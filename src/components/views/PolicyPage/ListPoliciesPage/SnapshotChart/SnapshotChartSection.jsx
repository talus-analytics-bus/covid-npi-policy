import React, { useContext } from "react";
import { useLocation } from "react-router-dom";

import SnapshotChart from "./SnapshotChart";

import styles from "./SnapshotChartSection.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const SnapshotChartSection = () => {
  const location = useLocation();
  const [iso3, state] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-2);

  const { policySummaryObject } = React.useContext(policyContext);

  const policyScope =
    state !== "national" ? "state and county" : "national and local";

  const policyCount = Object.values(policySummaryObject).reduce(
    (acc, category) => ({
      count: acc.count + category.count,
      active: acc.active + category.active,
    }),
    { count: 0, active: 0 }
  );

  console.log(policyCount);

  return (
    <div className={styles.chartContainer}>
      <SnapshotChart {...{ policySummaryObject }} />
      <div className={styles.legend}>
        {policySummaryObject && (
          <>
            <div className={styles.entry}>
              <div
                className={styles.active}
                style={{ background: "#409384" }}
              />
              <span>
                <strong>{policyCount.active}</strong> active {policyScope}{" "}
                policies
              </span>
            </div>
            <div className={styles.entry}>
              <div className={styles.total} style={{ background: "#96C4BB" }} />
              <span>
                <strong>{policyCount.count}</strong> total {policyScope}{" "}
                policies
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SnapshotChartSection;
