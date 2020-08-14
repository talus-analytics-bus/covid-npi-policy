import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./accessibilitynote.module.scss";

const AccessibilityNote = () => {
  // CONSTANTS
  // list of emails to display
  const emails = (
    <a href="mailto:info@talusanalytics.com" target="_blank">
      info@talusanalytics.com
    </a>
  );

  // original list of three emails as of Aug 14, 2020
  // const emails = (
  //   <>
  //     <a href="mailto:outbreaks@georgetown.edu" target="_blank">
  //       outbreaks@georgetown.edu
  //     </a>
  //     ,{" "}
  //     <a href="mailto:covidlocal@nti.org" target="_blank">
  //       covidlocal@nti.org
  //     </a>
  //     , or{" "}
  //     <a href="mailto:info@talusanalytics.com" target="_blank">
  //       info@talusanalytics.com
  //     </a>
  //   </>
  // );

  // JSX
  return (
    <p className={classNames(styles.accessibilityNote, styles.warning)}>
      <div className={styles.warningIcon} />
      <div>
        If you have any accessibility issues using this site, please contact us
        directly at {emails}.
      </div>
    </p>
  );
};

export default AccessibilityNote;
