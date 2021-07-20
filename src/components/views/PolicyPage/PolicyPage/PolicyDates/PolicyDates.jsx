import React from "react";

import courtChallengeIcon from "../../../../../assets/icons/CourtChallengeIcon.svg";

import styles from "../PolicyPage.module.scss";

// TODO: replace with <FMT.Date> component
const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const PolicyDates = ({ policy }) => (
  <>
    <div className={styles.row}>
      <div className={styles.col}>
        <h3>Published in</h3>
        <p>{policy && policy.policy_name}</p>
      </div>
    </div>

    <div className={styles.headerInfoRow}>
      <div className={styles.col}>
        <h3>Effective from</h3>
        <p>{policy && formatDate(new Date(policy.date_start_effective))}</p>
      </div>
      <div className={styles.col}>
        <h3>Ended</h3>
        <p>
          {policy &&
            ((policy.date_end_actual &&
              formatDate(new Date(policy.date_end_actual))) ||
              "Active")}
        </p>
      </div>
      <div className={styles.col}>
        <h3>Date Issued</h3>
        <p>
          {policy &&
            (policy.date_issued
              ? formatDate(new Date(policy.date_issued))
              : "Not Specified")}
        </p>
      </div>
      {policy && policy.court_challenges && (
        <div className={styles.col}>
          <div className={styles.courtChallengeIcon}>
            <img src={courtChallengeIcon} alt="Court Challenge Icon" />
            <h3>
              Challenged <br />
              In Court
            </h3>
          </div>
        </div>
      )}
    </div>
  </>
);

export default PolicyDates;
