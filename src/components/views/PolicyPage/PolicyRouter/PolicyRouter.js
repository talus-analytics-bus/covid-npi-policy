import React from "react";
import axios from "axios";
import {
  Switch,
  Route,
  useRouteMatch,
  useParams,
  useLocation,
} from "react-router-dom";

import { Caseload } from "../../../misc/Queries";
import PlaceQuery from "../../../misc/PlaceQuery";

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
  useLocation();

  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const match = useRouteMatch();
  const { iso3, state } = useParams();

  const [policyObject, setPolicyObject] = React.useState({});

  // React.useEffect(() => {
  //   alert("reset policyObject");
  //   console.log("reset policyObject");
  //   setPolicyObject({});
  // }, [iso3, state]);

  const [policySummaryObject, setPolicySummaryObject] = React.useState({});
  const [policySearchResults, setPolicySearchResults] = React.useState();
  const [policySearchPage, setPolicySearchPage] = React.useState(1);
  const policyListScrollPos = React.useState(0);

  const [caseload, setCaseload] = React.useState();
  const [policyStatus, setPolicyStatus] = React.useState();
  const [status, setStatus] = React.useState({
    policies: "initial",
    policiesSummary: "initial",
    caseload: "initial",
    policyStatus: "initial",
    searchResults: "initial",
  });

  const [policyFilters, setPolicyFilters] = React.useState({
    iso3: [iso3],
    ...(state !== "national" && { area1: [state] }),
  });

  React.useEffect(() => {
    setPolicyFilters(prev => ({
      ...prev,
      iso3: [iso3],
      ...(state !== "national" && { area1: [state] }),
    }));
  }, [iso3, state]);

  const [policySort, setPolicySort] = React.useState("desc");

  const [locationName, setLocationName] = React.useState(
    state !== "national" ? state : iso3
  );

  React.useEffect(() => {
    const getPlaceName = async () => {
      const places = await PlaceQuery({ place_type: ["country"] });
      const placeName = places.find(place => place.iso === iso3);
      if (placeName) setLocationName(placeName.name);
    };

    if (state === "national") getPlaceName();
    else setLocationName(state);
  }, [state, iso3]);

  const [targets, setTargets] = React.useState({ all: [], selected: [] });

  const policyContextValue = {
    policyObject,
    setPolicyObject,
    caseload,
    policyStatus,
    policyListScrollPos,
    status,
    setStatus,
    locationName,
    policyFilters,
    setPolicyFilters,
    policySort,
    setPolicySort,
    policySummaryObject,
    setPolicySummaryObject,
    policySearchResults,
    setPolicySearchResults,
    policySearchPage,
    setPolicySearchPage,
    targets,
    setTargets,
  };

  React.useEffect(() => {
    const getCaseload = async () => {
      console.log(`Get Caseload`);
      setStatus(prev => ({ ...prev, caseload: "loading" }));

      const response = await Caseload({
        countryIso3: iso3,
        stateName: state === "national" ? undefined : state,
        windowSizeDays: 1,
      });

      if (response.length > 10000) {
        setStatus(prev => ({ ...prev, caseload: "error" }));
      } else {
        setCaseload(
          response.map(point => ({
            date: new Date(point.date_time.split(" ")[0]),
            value: point.value,
          }))
        );

        setStatus(prev => ({ ...prev, caseload: iso3 }));
      }
    };

    if (!["error", "loading", iso3].includes(status.caseload)) getCaseload();

    const getPolicyStatus = async () => {
      console.log(`Get PolicyStatus`);
      setStatus(prev => ({ ...prev, policyStatus: "loading" }));

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

      if (testreq.data.data.length === 0) {
        console.log("set policyStatus Error");
        setStatus(prev => ({ ...prev, policyStatus: "error" }));
      } else {
        setPolicyStatus(testreq.data.data);
        setStatus(prev => ({ ...prev, policyStatus: iso3 }));
      }
    };

    if (!["error", "loading", iso3].includes(status.policyStatus))
      getPolicyStatus();
  }, [iso3, state, status]);

  const miniMapScope = iso3 === "USA" ? "USA" : "world";

  // console.log(status);

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
