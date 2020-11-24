import React from "react";
import { useParams } from "react-router-dom";

import { Policy, Caseload } from "../../../misc/Queries";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

// export const loadCategories = ({iso3, state, })

// the policy router manages shared data among
// policy pages to prevent repeat requests
const PolicyRouter = props => {
  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const { iso3, state, policyID } = useParams();

  const [policyList, setPolicyList] = React.useState();
  const [policyDetails, setPolicyDetails] = React.useState();

  const [caseload, setCaseload] = React.useState();

  // Get category and subcategory for all policies
  React.useEffect(() => {
    const loadCategories = async () => {
      const policies = await Policy({
        method: "post",
        filters: [
          {
            area1: ["Michigan"],
            iso3: ["USA"],
          },
        ],
        page: 1,
        pagesize: 1000,
        ordering: [["id", "asc"]],
        fields: [
          "id",
          "place",
          "primary_ph_measure",
          "file",
          "date_start_effective",
        ],
      });
      console.log(policies);
    };
    loadCategories();
  }, [iso3, state]);

  return (
    <MiniMap.Provider scope={state !== "national" ? "USA" : "world"}>
      {policyID ? <PolicyPage /> : <ListPoliciesPage />}
    </MiniMap.Provider>
  );
};

export default PolicyRouter;
