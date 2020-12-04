import React from "react";
import { Switch, Route, useRouteMatch, useParams } from "react-router-dom";

// import { Policy, Caseload } from "../../../misc/Queries";

import {
  loadPolicyCategories,
  loadPolicySubCategories,
} from "./PolicyLoaders.js";

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

  const match = useRouteMatch();
  const { state } = useParams();

  const [policyObject, setPolicyObject] = React.useState({});

  // const [caseload, setCaseload] = React.useState();

  console.log("render router");
  return (
    <MiniMap.Provider scope={state !== "national" ? "USA" : "world"}>
      <Switch>
        <Route path={`${match.url}/:policyID`}>
          <PolicyPage {...{ policyObject, setPolicyObject }} />
        </Route>
        <Route path={match.path}>
          <ListPoliciesPage {...{ policyObject, setPolicyObject }} />
        </Route>
      </Switch>
    </MiniMap.Provider>
  );
};

export default PolicyRouter;
