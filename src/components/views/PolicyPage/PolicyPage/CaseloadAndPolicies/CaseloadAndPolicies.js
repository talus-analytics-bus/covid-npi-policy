import React from "react";
import { useLocation } from "react-router-dom";

import { Policy } from "api/queryTypes";
// import { getObjectByPath } from "../../objectPathTools";
import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../PolicyRouter/PolicyLoaders";

import CaseloadPlot from "../../CaseloadPlotD3/CaseloadPlot";

import { policyContext } from "../../PolicyRouter/PolicyRouter";

const CaseloadAndPolicies = props => {
  const location = useLocation();
  const [iso3, , policyID] = location.pathname
    .replace(/\/$/, "")
    .split("/")
    .slice(-3);

  const { policyObject, policyFilters } = React.useContext(policyContext);

  const { policyObjectPath } = props;

  const [simultaneousPolicies, setSimultaneousPolicies] = React.useState({});

  React.useEffect(() => {
    const requestSimultaneousPolicies = async () => {
      // console.log(policyObjectPath);

      const filterByLoc =
        (iso3 === "USA" && policyObjectPath[2] === "Local") ||
        (iso3 !== "USA" && policyObjectPath[2] === "State / Province");

      const policyResponse = await Policy({
        method: "post",
        filters: {
          ...policyFilters,
          level: [policyObjectPath[2]],
          [CATEGORY_FIELD_NAME]: [policyObjectPath[0]],
          [SUBCATEGORY_FIELD_NAME]: [policyObjectPath[4]],
          ...(filterByLoc && { loc: [policyObjectPath[6]] }),
        },
        ordering: [["date_start_effective", "asc"]],
        fields: [
          "id",
          "desc",
          "policy_name",
          "date_start_effective",
          "date_end_actual",
          "auth_entity",
        ],
      });

      const otherPolicies = policyResponse.data.filter(
        policy => `${policy.id}` !== policyID
      );

      if (otherPolicies.length === 0) {
        setSimultaneousPolicies(false);
      } else {
        const otherPoliciesObject = {};
        otherPolicies.forEach(policy => {
          otherPoliciesObject[`ID${policy.id}`] = policy;
        });
        setSimultaneousPolicies({
          policyID: policyID,
          policies: otherPoliciesObject,
        });
      }
    };

    if (
      policyObjectPath &&
      simultaneousPolicies !== false &&
      simultaneousPolicies.policyID !== policyID
    ) {
      // console.log("related policies check");
      // const policiesInCategory = getObjectByPath({
      //   obj: policyObject,
      //   path: policyObjectPath.slice(0, -1),
      // });
      //
      // if (policiesInCategory) {
      //   const otherPolicies = Object.keys(policiesInCategory)
      //     .filter(key => key !== `ID${policyID}`)
      //     .reduce(
      //       (obj, key) => ({ ...obj, [key]: policiesInCategory[key] }),
      //       {}
      //     );
      //
      // if (Object.keys(otherPolicies).length > 1)
      //   setSimultaneousPolicies({
      //     policyID: policyID,
      //     policies: otherPolicies,
      //   });
      // else
      requestSimultaneousPolicies();
    }
  }, [
    iso3,
    policyObject,
    policyObjectPath,
    policyID,
    simultaneousPolicies,
    policyFilters,
  ]);

  // console.log(simultaneousPolicies);

  return (
    <CaseloadPlot
      path={policyObjectPath}
      simultaneousPolicies={simultaneousPolicies.policies}
      activePolicy={props.policy}
    />
  );
};

export default CaseloadAndPolicies;
