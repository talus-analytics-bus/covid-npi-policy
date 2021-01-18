import React from "react";
import { useLocation } from "react-router-dom";

import { Policy } from "../../../../misc/Queries";
import { getObjectByPath } from "../../objectPathTools";
import { CATEGORY_FIELD_NAME } from "../../PolicyRouter/PolicyLoaders";

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

  const [simultaneousPolicies, setSimultaneousPolicies] = React.useState();

  React.useEffect(() => {
    const requestSimultaneousPolicies = async () => {
      console.log(policyObjectPath);

      const filterByLoc =
        (iso3 === "USA" && policyObjectPath[2] === "Local") ||
        (iso3 !== "USA" && policyObjectPath[2] === "State / Province");

      console.log({
        ...policyFilters,
        [CATEGORY_FIELD_NAME]: [policyObjectPath[0]],
        level: [policyObjectPath[2]],
        ...(filterByLoc && { loc: [policyObjectPath[6]] }),
      });

      const policyResponse = await Policy({
        method: "post",
        filters: {
          ...policyFilters,
          [CATEGORY_FIELD_NAME]: [policyObjectPath[0]],
          level: [policyObjectPath[2]],
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
        policy => policy.id !== `ID${policyID}`
      );

      if (otherPolicies.length === 0) {
        setSimultaneousPolicies(false);
      } else {
        const otherPoliciesObject = {};
        otherPolicies.forEach(policy => {
          otherPoliciesObject[`ID${policy.id}`] = policy;
        });
        setSimultaneousPolicies(otherPoliciesObject);
      }
    };

    if (!simultaneousPolicies) {
      console.log("related policies check");
      const policiesInCategory = getObjectByPath({
        obj: policyObject,
        path: policyObjectPath.slice(0, -1),
      });

      if (policiesInCategory) {
        const otherPolicies = Object.keys(policiesInCategory)
          .filter(key => key !== `ID${policyID}`)
          .reduce(
            (obj, key) => ({ ...obj, [key]: policiesInCategory[key] }),
            {}
          );

        if (Object.keys(otherPolicies).length !== 0)
          setSimultaneousPolicies(otherPolicies);
        else requestSimultaneousPolicies();
      }
    }
  }, [
    iso3,
    policyObject,
    policyObjectPath,
    policyID,
    simultaneousPolicies,
    policyFilters,
  ]);

  console.log(simultaneousPolicies);

  return (
    <>
      {simultaneousPolicies &&
        Object.entries(simultaneousPolicies).map(([policyID, policy]) => (
          <p key={policyID}>{policy.policy_name}</p>
        ))}
      <CaseloadPlot />
    </>
  );
};

export default CaseloadAndPolicies;
