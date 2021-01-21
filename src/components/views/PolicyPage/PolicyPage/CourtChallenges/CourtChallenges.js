import React from "react";

import { Challenge } from "../../../../misc/Queries.js";
import courtChallengeIcon from "../../../../../assets/icons/CourtChallengeIcon.svg";

import styles from "./CourtChallenges.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  if (typeof date === "string") date = new Date(date);
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const CourtChallenges = ({ policy }) => {
  const [challenges, setChallenges] = React.useState();

  React.useEffect(() => {
    const getChallenges = async () => {
      console.log({
        filters: {
          id: policy.court_challenges.map(challenge => challenge.id),
        },
      });
      const challengeResponse = await Challenge({
        method: "post",
        filters: {
          id: policy.court_challenges.map(challenge => challenge.id),
          // filed_in_state_or_federal_court: ["State"],
        },
        fields: [
          "id",
          "date_of_complaint",
          "date_of_decision",
          // "case_status",
          "government_order_upheld_or_enjoined",
          "parties",
          "filed_in_state_or_federal_court",
          "court",
          "case_number",
          "complaint_category",
          "holding",
          "summary_of_action",
        ],
      });

      // console.log(challengeResponse);
      setChallenges(challengeResponse.data);
    };

    if (policy && policy.court_challenges) getChallenges();
  }, [policy]);

  if (policy && policy.court_challenges) {
    return (
      <>
        {challenges &&
          challenges.map(challenge => (
            <section key={challenge.id} className={styles.courtChallenge}>
              <header className={styles.header}>
                <h2>Court Challenge</h2>
                <img src={courtChallengeIcon} alt="Court Challenge Icon" />
              </header>
              <div className={styles.info}>
                <div className={styles.leftCol}>
                  <div className={styles.metadata}>
                    <div>
                      <h3>Date of Complaint</h3>
                      <p>
                        <strong>
                          {formatDate(challenge.date_of_complaint)}
                        </strong>
                      </p>
                    </div>
                    <div>
                      <h3>Date of Decision</h3>
                      <p>
                        <strong>
                          {formatDate(challenge.date_of_decision)}
                        </strong>
                      </p>
                    </div>
                    <div>
                      <h3>Case Status</h3>
                      <p>
                        <strong>
                          {challenge.government_order_upheld_or_enjoined}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <h3>Sumary of Proceedings</h3>
                  {/* Double check that this is the right field */}
                  <p>
                    {challenge.summary_of_action
                      ? challenge.summary_of_action
                      : "Summary Pending"}
                  </p>
                  <h3>Holding</h3>
                  <p>
                    {challenge.holding ? challenge.holding : "Holding Pending"}
                  </p>
                </div>
                <div className={styles.rightCol}>
                  <div className={styles.metadata}>
                    <div>
                      <h3>State or Federal</h3>
                      <p>
                        <strong>
                          {challenge.filed_in_state_or_federal_court}
                        </strong>
                      </p>
                    </div>
                    <div>
                      <h3>Court</h3>
                      <p>
                        <strong>{challenge.court}</strong>
                      </p>
                    </div>
                    <div>
                      <h3>Parties</h3>
                      <p>
                        <strong>{challenge.parties}</strong>
                      </p>
                    </div>
                    <div>
                      <h3>Case Number</h3>
                      <p>
                        <strong>{challenge.case_number}</strong>
                      </p>
                    </div>
                    <div>
                      <h3>
                        Complaint{" "}
                        {challenge.complaint_category.length > 1
                          ? "Categories"
                          : "Category"}
                      </h3>
                      {challenge.complaint_category &&
                        challenge.complaint_category.map(category => (
                          <p key={category}>
                            <strong>{category}</strong>
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
      </>
    );
  } else return false;
};

export default CourtChallenges;
