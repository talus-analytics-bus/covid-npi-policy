import React, { useContext, useEffect, useState } from "react";

// need recoil for triggering a render from the slider
// to the snapshotChart without re-rendering
// everything in between.
import { RecoilRoot } from "recoil";

import IntroParagraph from "../IntroParagraph/IntroParagraph";
import PolicyEnvironmentPlot from "../PolicyEnvironmentPlot/PolicyEnvironmentPlot";
import SnapshotChartSection from "../SnapshotChart/SnapshotChartSection";

import styles from "./IntroSection.module.scss";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const IntroSection = () => {
  const { status } = useContext(policyContext);
  return (
    <section className={styles.introSection}>
      <RecoilRoot>
        <div className={styles.policyEnvironment}>
          <PolicyEnvironmentPlot />
        </div>
        <div className={styles.barChartAndParagraph}>
          {status.policies !== "error" && <SnapshotChartSection />}
          <IntroParagraph />
        </div>
      </RecoilRoot>
    </section>
  );
};

export default IntroSection;
