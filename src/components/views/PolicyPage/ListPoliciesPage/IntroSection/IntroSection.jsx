import React, { useContext } from "react";

import IntroParagraph from "../IntroParagraph/IntroParagraph";
import PolicyEnvironmentPlot from "../PolicyEnvironmentPlot/PolicyEnvironmentPlot";
import SnapshotChartSection from "../SnapshotChart/SnapshotChartSection";

import styles from "./IntroSection.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const IntroSection = () => {
  const { policySummaryObject } = useContext(policyContext);

  console.log(policySummaryObject);
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
