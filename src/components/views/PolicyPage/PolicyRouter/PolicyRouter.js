import React from "react";
import axios from "axios";
import { Switch, Route, useRouteMatch, useParams } from "react-router-dom";

import { Caseload, DistancingLevel } from "../../../misc/Queries";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

const API_URL = process.env.REACT_APP_API_URL;

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
    // geo_res: state === "national" ? "national" : "state",

    const getPolicyStatus = async () => {
      console.log(`Get PolicyStatus`);

      // helper function doesn't work just yet
      // const response = await DistancingLevel({
      //   // method: "get",
      //   iso3: "USA",
      //   geo_res: "state",
      //   state_name: "California",
      //   deltas_only: true,
      //   all_dates: true,
      // });

      const testreq = await axios(`${API_URL}/get/distancing_levels`, {
        params: {
          iso3,
          geo_res: state === "national" ? "country" : "state",
          ...(state !== "national" && { state_name: state }),
          deltas_only: true,
          all_dates: true,
        },
      });

      setPolicyStatus(testreq.data.data);
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
