import React from "react";
import { useParams } from "react-router-dom";

// import { Policy, Caseload } from "../../../misc/Queries";

import { loadPolicyCategories } from "./PolicyLoaders.js";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

// the policy router manages shared data among
// policy pages to prevent repeat requests
const PolicyRouter = props => {
  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const { iso3, state, policyID } = useParams();

  const [policyObject, setPolicyObject] = React.useState();

  // const [caseload, setCaseload] = React.useState();

  // Get category and subcategory for all policies
  React.useEffect(() => {
    const filters = { iso3: [iso3] };
    if (state !== "national") {
      filters["area1"] = [state];
    }
    loadPolicyCategories({
      filters,
      stateSetter: setPolicyObject,
    });
  }, [iso3, state]);

  console.log("render router");
  return (
    <MiniMap.Provider scope={state !== "national" ? "USA" : "world"}>
      {policyID ? (
        <PolicyPage />
      ) : (
        <ListPoliciesPage {...{ policyObject, setPolicyObject }} />
      )}
    </MiniMap.Provider>
  );
};

export default PolicyRouter;
