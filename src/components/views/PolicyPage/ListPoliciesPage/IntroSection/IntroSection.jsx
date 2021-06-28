import React, { useContext, useEffect, useState } from "react";

// need recoil for rendering straight from the slider
// to the snapshotChart without re-rendering
// everything in between.
import { RecoilRoot } from "recoil";

// import IntroParagraph from "../IntroParagraph/IntroParagraph";
import PolicyEnvironmentPlot from "../PolicyEnvironmentPlot/PolicyEnvironmentPlot";
import SnapshotChartSection from "../SnapshotChart/SnapshotChartSection";

import styles from "./IntroSection.module.scss";

const IntroSection = () => (
  <section>
    <RecoilRoot>
      <div className={styles.policyEnvironment}>
        <PolicyEnvironmentPlot />
      </div>
      <div className={styles.barChartAndParagraph}>
        <SnapshotChartSection />
        {/* <IntroParagraph /> */}
      </div>
    </RecoilRoot>
  </section>
);

export default IntroSection;
