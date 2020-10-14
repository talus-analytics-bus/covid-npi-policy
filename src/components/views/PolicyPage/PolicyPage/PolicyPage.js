import React from "react";

import BlueExpandBox from "../BlueExpandBox/BlueExpandBox";

import styles from "./PolicyPage.module.scss";

const PolicyPage = ({ setLoading, setPage }) => {
  // on init render, set loading to false and page to `model`
  React.useEffect(() => {
    setLoading(false);
    setPage("policy");
  }, [setLoading, setPage]);

  return (
    <div className={styles.main}>
      <header className={styles.titleHeader}>
        <h1>
          PROCLAMATION BY THE GOVERNOR 20-25.4; SAFE START WASHINGTON MAY 31
          VERSION
        </h1>
      </header>
      <section className={styles.metadata}>
        <div className={styles.leftCol}>
          <h2>Government</h2>
          <p>[county] [state] [country]</p>
          <h2>Authority</h2>
          <h3>Office</h3>
          <p>[Office]</p>
          <h3>Official</h3>
          <p>[Official]</p>
          <h2>State Structure</h2>
          <div className={styles.cols}>
            <div className={styles.col}>
              <h3>Home Rule</h3>
              <p>[Home Rule]</p>
            </div>
            <div className={styles.col}>
              <h3>Dillon's Rule</h3>
              <p>[Home Rule]</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.policySection}>
        <BlueExpandBox>
          <header className={styles.policySectionHeader}>
            <h1>[Date]</h1>
            <h2>[Sections Count]</h2>
            <a href="/downloadFile" className={styles.downloadButton}>
              Download (pdf)
            </a>
          </header>
          <p>lorem ipsum</p>
        </BlueExpandBox>
      </section>
    </div>
  );
};

export default PolicyPage;
