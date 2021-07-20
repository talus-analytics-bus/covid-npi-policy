import React from "react";
import { Link } from "react-router-dom";

import PolicyCategoryIcon from "../../PolicyCategoryIcon/PolicyCategoryIcon";

import styles from "./PolicyBreadcrumbs.module.scss";

const PolicyBreadcrumbs = ({ iso3, state, policyObjectPath }) => (
  <div className={styles.breadCrumbs}>
    {iso3 !== "Unspecified" && (
      <>
        <PolicyCategoryIcon
          category={policyObjectPath && policyObjectPath[0]}
          style={{ marginRight: "1em" }}
        />
        <Link to={`/policies/${iso3}/${state}`}>
          {policyObjectPath &&
            policyObjectPath
              .filter(
                s =>
                  ![
                    "children",
                    // "Local",
                    // "Country",
                    // "State / Province",
                  ].includes(s)
              )
              .slice(0, -2)
              .map(e => (
                <React.Fragment key={e}>{e} &nbsp; 〉 </React.Fragment>
              ))}
          {policyObjectPath && policyObjectPath.slice(-3)[0]}
        </Link>
      </>
    )}
  </div>
);

export default PolicyBreadcrumbs;
