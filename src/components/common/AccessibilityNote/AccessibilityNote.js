import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./accessibilitynote.module.scss";

const AccessibilityNote = () => {
  return (
    <p className={classNames(styles.accessibilityNote, styles.warning)}>
      <div className={styles.warningIcon} />
      <div>
        If you have any accessibility issues using this site, please contact us
        directly at{" "}
        <a href="mailto:outbreaks@georgetown.edu" target="_blank">
          outbreaks@georgetown.edu
        </a>
        ,{" "}
        <a href="mailto:covidlocal@nti.org" target="_blank">
          covidlocal@nti.org
        </a>
        , or{" "}
        <a href="mailto:info@talusanalytics.com" target="_blank">
          info@talusanalytics.com
        </a>
      </div>
    </p>
  );
};

export default AccessibilityNote;
