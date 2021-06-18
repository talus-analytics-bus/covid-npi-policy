import React from "react";

import IntroParagraph from "../IntroParagraph/IntroParagraph";
import PolicyEnvironmentPlot from "../PolicyEnvironmentPlot/PolicyEnvironmentPlot";
import SnapshotChartSection from "../SnapshotChart/SnapshotChartSection";

import styles from "./IntroSection.module.scss";

const IntroSection = () => {
  return (
    <section>
      <div className={styles.policyEnvironment}>
        <PolicyEnvironmentPlot />
      </div>
      <div className={styles.barChartAndParagraph}>
        <SnapshotChartSection />
        <IntroParagraph />
      </div>
    </section>
  );
};

export default IntroSection;
