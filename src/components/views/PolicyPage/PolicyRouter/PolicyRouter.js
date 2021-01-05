import React from "react";
import { Switch, Route, useRouteMatch, useParams } from "react-router-dom";

import { Caseload, PolicyStatus } from "../../../misc/Queries";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

// the policy router manages shared data among
// policy pages to prevent repeat requests
// and it sets up the minimap provider since
// all maps within this set of routes will
// share the same scope

export const policyContext = React.createContext();

const PolicyRouter = props => {
  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const match = useRouteMatch();
  const { iso3, state } = useParams();

  const [policyObject, setPolicyObject] = React.useState({});
  const policyListScrollPos = React.useState(0);

  const [caseload, setCaseload] = React.useState();
  const [policyStatus, setPolicyStatus] = React.useState();

  const policyContextValue = {
    policyObject,
    setPolicyObject,
    caseload,
    policyStatus,
    policyListScrollPos,
  };

  React.useEffect(() => {
    const getCaseload = async () => {
      console.log(`Get Caseload`);
      const response = await Caseload({
        countryIso3: iso3,
        stateName: state === "national" ? undefined : state,
        windowSizeDays: 1,
      });

      setCaseload(
        response.map(point => ({
          date: new Date(point.date_time),
          value: point.value,
        }))
      );
    };

    getCaseload();

    const getPolicyStatus = async () => {
      console.log(`Get PolicyStatus`);
      const response = await PolicyStatus({
        countryIso3: iso3,
        geo_res: state === "national" ? "national" : "state",
        filters: { lockdown_level: ["lockdown_level"] },
        fields: { deltas_only: true },
      });

      console.log(response);

      setPolicyStatus(
        response.map(point => ({
          date: new Date(point.date_time),
          value: point.value,
        }))
      );
    };

    getPolicyStatus();
  }, [iso3, state]);

  const miniMapScope = state !== "national" ? "USA" : "world";

  console.log("render router");

  return (
    <MiniMap.Provider scope={miniMapScope}>
      <policyContext.Provider value={policyContextValue}>
        <Switch>
          <Route path={`${match.url}/:policyID`}>
            <PolicyPage />
          </Route>
          <Route path={match.path}>
            <ListPoliciesPage />
          </Route>
        </Switch>
      </policyContext.Provider>
    </MiniMap.Provider>
  );
};

export default PolicyRouter;
