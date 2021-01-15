import React from "react";

import styles from "./ActiveFilterBar.module.scss";
import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const ActiveFilterBar = props => {
  const { policyFilters } = React.useContext(policyContext);

  if (policyFilters.subtarget || policyFilters.dates_in_effect)
    return (
      <>
        <p>Active Filters:</p>
        <div className={styles.activeFilters}>{props.children}</div>
      </>
    );
  else return <></>;
};

export default ActiveFilterBar;
