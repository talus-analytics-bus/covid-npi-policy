import React from "react";
import BlueExpandBox from "../../BlueExpandBox/BlueExpandBox";

import styles from "./PolicyDateSection.module.scss";

const PolicyDateSection = props => (
  <section className={styles.policySection}>
    <BlueExpandBox open={props.open}>
      <header className={styles.policySectionHeader}>
        <h1>{props.date}</h1>
        <h2>
          {props.policies.length === 1
            ? "1 Policy section"
            : `${props.policies.length} Policy sections`}
        </h2>
        <a
          href={`/${props.policies[0].file[0]}`}
          className={styles.downloadButton}
          onClick={e => e.stopPropagation()}
        >
          Download (pdf)
        </a>
      </header>
      {props.children}
    </BlueExpandBox>
  </section>
);

export default PolicyDateSection;
