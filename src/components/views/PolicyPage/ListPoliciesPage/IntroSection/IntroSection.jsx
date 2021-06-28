import React, { useContext, useEffect, useState } from "react";

import IntroParagraph from "../IntroParagraph/IntroParagraph";
import PolicyEnvironmentPlot from "../PolicyEnvironmentPlot/PolicyEnvironmentPlot";
import SnapshotChartSection from "../SnapshotChart/SnapshotChartSection";

import styles from "./IntroSection.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const IntroSection = () => {
  const { policySummaryObject } = useContext(policyContext);

  const [introDate, setIntroDate] = useState();

  useEffect(() => {
    if (policySummaryObject) {
      const dates = Object.keys(policySummaryObject);
      setIntroDate(dates[dates.length - 1]);
    }
  }, [policySummaryObject]);

  console.log(policySummaryObject);
  return (
    <section>
      <div className={styles.policyEnvironment}>
        <PolicyEnvironmentPlot />
      </div>
      <div className={styles.barChartAndParagraph}>
        <SnapshotChartSection />
        {/* <IntroParagraph {...{ introDate }} /> */}
      </div>
    </section>
  );
};

export default IntroSection;
