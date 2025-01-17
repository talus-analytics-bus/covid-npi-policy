import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Switch,
  Route,
  useRouteMatch,
  useParams,
  useLocation,
} from "react-router-dom";

import { Caseload } from "api/Queries";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

// utilities
import { removeParenthetical } from "components/misc/UtilsTyped";
import { LoadingSpinner } from "components/common";

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
  const [policyCategories, setPolicyCategories] = React.useState({});

  const [policySummaryObject, setPolicySummaryObject] = React.useState({});
  const [policySearchResults, setPolicySearchResults] = React.useState();
  const [policySearchPage, setPolicySearchPage] = React.useState(1);
  const [policyListScrollPos, setPolicyListScrollPos] = React.useState(0);

  const [caseload, setCaseload] = React.useState();
  const [policyStatus, setPolicyStatus] = React.useState();
  const [status, setStatus] = React.useState({});

  const [policyFilters, setPolicyFilters] = React.useState({
    iso3: [iso3],
    ...(state !== "national" && { area1: [state] }),
    dates_in_effect: ["2020-01-01", new Date().toISOString().split("T")[0]],
  });

  const [policySort, setPolicySort] = React.useState("desc");

  const [locationName, setLocationName] = React.useState(
    null
    // state !== "national" ? state : iso3 === "Unspecified" ? "Non-ISO3" : iso3
  );
  const [loadedIso3, setLoadedIso3] = useState(null);

  const [dateRangeControlValue, setDateRangeControlValue] = React.useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [targets, setTargets] = React.useState({ all: [], selected: [] });

  const [jurisdiction, setJurisdiction] = React.useState(
    state === "national"
      ? {
          all: [
            { id: 1, value: "Country", label: "Country" },
            { id: 2, value: "State / Province", label: "State / Province" },
          ],
          selected: [],
        }
      : {
          all: [
            { id: 2, value: "State / Province", label: "State" },
            { id: 3, value: "Local", label: "Local" },
          ],
          selected: [],
        }
  );

  const [searchTextInputValue, setSearchTextInputValue] = React.useState(
    (policyFilters._text && policyFilters._text[0]) || ""
  );

  const policyContextValue = {
    policyObject,
    setPolicyObject,
    policyCategories,
    setPolicyCategories,
    caseload,
    policyStatus,
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
    jurisdiction,
    setJurisdiction,
    searchTextInputValue,
    setSearchTextInputValue,
    dateRangeControlValue,
    setDateRangeControlValue,
    policyListScrollPos: [policyListScrollPos, setPolicyListScrollPos],
    showCharts: iso3 !== "Unspecified" && iso3 !== "EU",
    // showCharts: iso3 !== "Unspecified" && !["error"].includes(status.caseload),
  };

  // if state or country changes
  React.useEffect(() => {
    // scroll to the top
    window.scroll(0, 0);
    setPolicyListScrollPos(0);
    if (loadedIso3 !== iso3) return;
    // if (status.place !== "loaded") return;

    // setLocationName(
    //   null
    //   // state !== "national" ? state : iso3 === "Unspecified" ? "Non-ISO3" : iso3
    // );

    // reset filters
    setPolicyFilters({
      iso3: [iso3],
      ...(state !== "national" && { area1: [state] }),
      date_start_effective: [
        "2020-01-01",
        // "2021-07-08",
        new Date().toISOString().split("T")[0],
      ],
    });

    // reset filters internal state
    setDateRangeControlValue({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setTargets({ all: [], selected: [] });
    setJurisdiction(
      state === "national"
        ? {
            all: [
              { id: 1, value: "Country", label: "Country" },
              { id: 2, value: "State / Province", label: "State / Province" },
            ],
            selected: [],
          }
        : {
            all: [
              { id: 2, value: "State / Province", label: "State" },
              { id: 3, value: "Local", label: "Local" },
            ],
            selected: [],
          }
    );
    setSearchTextInputValue("");

    // clear policyObject
    setPolicyObject({});
    // clear categories
    setPolicyCategories({});
    // clear summary
    setPolicySummaryObject({});

    // set status of everything to initial
    // this marks everything to be reloaded
    setStatus({
      policies: "initial",
      policiesSummary: "initial",
      caseload: "initial",
      policyStatus: "initial",
      searchResults: "initial",
      // place: "initial",
    });

    setCaseload();

    // get new caseload
    const getCaseload = async () => {
      console.log(`Get Caseload`);
      setStatus(prev => ({ ...prev, caseload: "loading" }));

      const response = await Caseload({
        countryIso3: iso3,
        stateName: state === "national" ? undefined : state,
        windowSizeDays: 1,
      });

      if (response.length > 10000 || response.length === 0) {
        setStatus(prev => ({ ...prev, caseload: "error" }));
      } else {
        setCaseload(
          response.map(point => ({
            date: new Date(point.date_time.split(" ")[0]),
            value: Math.max(point.value, 0),
          }))
        );

        setStatus(prev => ({ ...prev, caseload: "loaded" }));
      }
    };

    getCaseload();

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

      const testreq = await axios(`${API_URL}/distancing_levels`, {
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
        setStatus(prev => ({ ...prev, policyStatus: "loaded" }));
      }
    };

    getPolicyStatus();
  }, [iso3, loadedIso3, state]);

  React.useEffect(() => {
    const getPlaceName = async () => {
      let params = new URLSearchParams();
      params.append("fields", "id");
      params.append("fields", "loc");
      params.append("fields", "iso3");
      params.append("include_policy_count", "true");
      params.append("level", "country");
      params.append("iso3", iso3);

      const countries = await axios(`${API_URL}/place`, { params });

      const placeName = countries.data.data[0];
      if (placeName) setLocationName(removeParenthetical(placeName.loc));
      setLoadedIso3(iso3);
    };
    if (loadedIso3 !== iso3) {
      if (state === "national") getPlaceName();
      else {
        setLocationName(state);
        setLoadedIso3(iso3);
      }
    }
  }, [state, iso3, loadedIso3]);

  const miniMapScope =
    iso3 === "USA" ? (state === "national" ? "world" : "USA") : "world";

  if (loadedIso3 !== iso3) return <LoadingSpinner delay={250} />;
  else
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
