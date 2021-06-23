/**
 * Define metrics, data sources, and metric metadata for use in Mapbox map
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// standard packages
import React, { ReactNode } from "react";

// 3rd party packages
import * as d3 from "d3";
import moment from "moment";

// utilities
import { comma, isLightColor } from "../../../misc/Util";

// queries
import ObservationQuery from "api/ObservationQuery";
import { DistancingLevel, PolicyStatusCounts } from "api/Queries";

// assets and styles
// import dots from "./assets/images/dots.png";
import CSS from "csstype";
import infostyles from "../../../common/InfoTooltip/plugins.module.scss";
import phase1 from "./assets/icons/phase-1.png";
import phase2 from "./assets/icons/phase-2.png";
import phase3 from "./assets/icons/phase-3.png";
import phase4 from "./assets/icons/phase-4.png";
// import mixed from "./assets/icons/phase-mixed.png";
import localLogo from "./assets/icons/logo-local-pill.png";

// assets and styles
import varsExports from "assets/styles/vars.module.scss";
import ObservationReduxQuery from "api/ObservationReduxQuery";
import {
  Filters,
  MapDefaults,
  MapId,
  MetricMeta,
  PolicyResolution,
} from "./mapTypes";
import { GeoRes, MetricDatum } from "api/queryTypes";

// utilities and local components
// import { greenStepsScale } from "./layers";

// constants
// colors imported from vars.module.scss
const {
  mapGreen1,
  mapGreen2,
  mapGreen3,
  mapGreen4,
  mapGreen5,
  mapGreen6,
  noDataGray,
} = varsExports;

// define default parameters for MapboxMap
const today = moment();
const yesterday = moment(today).subtract(1, "days");
export const defaults: MapDefaults = {
  // default map ID
  mapId: MapId.us_county_plus_state,

  // default date for map to start on
  // date: "2021-03-03",
  // date: yesterday.format("YYYY-MM-DD"),

  // min/max dates for date selection -- if there are none, then provide
  // `undefined` as value for each
  minMaxDate: {
    minDate: "2020-01-21",
    maxDate: yesterday.format("YYYY-MM-DD"),
  },

  // defaults for map with ID `us`
  us: {
    // id of default circle metric
    circle: "74",
    // id of default fill metric
    fill: "policy_status_counts",
    // fill: "lockdown_level",
    // base layer immediately behind which layers should be appended to map
    priorLayer: "state-points",
    initViewport: {
      latitude: -2.534888253109417,
      longitude: 6.042008668434793,
      zoom: 3.9432136288314994,
    },
  },
  // defaults for map with ID `us-county`
  "us-county": {
    // id of default circle metric
    circle: "104",
    "circle-state": "104",
    showCircle: true,
    // showCircle: false,
    // allowCircle: false,

    // id of default fill metric
    fill: "policy_status_counts",
    // fill: "lockdown_level",
    // base layer immediately behind which layers should be appended to map
    priorLayer: "county-points",
    initViewport: {
      latitude: -2.534888253109417,
      longitude: 6.042008668434793,
      zoom: 3.9432136288314994,
    },
  },
  get "us-county-plus-state"() {
    return this["us-county"];
  },
  // defaults for additional maps...
  global: {
    circle: "77",
    // fill: "lockdown_level",
    fill: "policy_status_counts",
    priorLayer: "country-label",
    initViewport: {
      latitude: 5.315112144927277,
      longitude: 18.895843377706207,
      zoom: 1.8386647937804286,
    },
  },
};

// constants
export const COVID_LOCAL_URL = process.env.REACT_APP_COVID_LOCAL_URL;

/**
 * Divides each value of a metric data series by 7 to yield the y-day average.
 * @param {MetricDatum} d
 * The metric datum whose numeric value should be divided by 7
 * @returns {void}
 */
const get7dayAvg = (d: MetricDatum): void => {
  d.value = (d.value as number) / 7.0;
};

/**
 * Arguments for policy counts endpoint.
 */
interface PolicyCountsFuncArgs {
  filters: Filters;
  policyResolution: PolicyResolution;
  mapId: MapId;
}

interface DistancingLevelFuncArgs {
  filters: Filters;
  state_name?: string;
  iso3?: string;
}

// define metrics to retrieve for each map
export const allMapMetrics = {
  // map ID of map in which metrics are used
  us: [
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: DistancingLevel,

      // params that must be passed to `queryFunc` as object
      params: {
        func: ({
          filters,
          state_name,
        }: DistancingLevelFuncArgs): Record<string, any> => {
          const baseParams = {
            method: "get",
            geo_res: GeoRes.state,
            date: filters.dates_in_effect[0],
            state_name,
          };
          return baseParams;
        },
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "lockdown_level",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "lockdown_level" },

      // filter to control what features are returned for layers that are
      // displaying this metric
      filter: ["==", ["get", "type"], "state"],

      // whether trend data should be retrieved for this metric
      // NOTE: only applies to generalized metrics
      trend: false,

      // info about layers that use this metric
      styleOptions: {
        // whether layers that display this metric should be outlined
        // NOTE: if true, an outline style must be defined in `./layers.js`
        outline: true,

        // // whether layers that display this metric should have a pattern layers
        // // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true,
      },
    },
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: PolicyStatusCounts,

      // params that must be passed to `queryFunc` as object
      params: {
        func: ({
          filters,
          policyResolution,
          mapId,
        }: PolicyCountsFuncArgs): Record<string, any> => {
          const countSub = policyResolution === PolicyResolution.subgeo;
          return {
            method: "post",
            filters,
            geo_res: GeoRes.state,
            count_sub: countSub,
            include_min_max: true,
            mapId,
          };
        },
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "policy_status_counts",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "policy_status_counts" },

      // filter to control what features are returned for layers that are
      // displaying this metric
      filter: ["==", ["get", "type"], "state"],

      // whether trend data should be retrieved for this metric
      // NOTE: only applies to generalized metrics
      trend: false,

      // info about layers that use this metric
      styleOptions: {
        // whether layers that display this metric should be outlined
        // NOTE: if true, an outline style must be defined in `./layers.js`
        outline: true,

        // whether layers that display this metric should have a pattern layers
        // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true
      },
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: 74,
        temporal_resolution: "daily",
        spatial_resolution: "state",
        fields: ["value", "date_time", "place_name", "place_id"],
        transform: get7dayAvg,
      },
      id: "74",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-transp" },
      filter: ["==", ["get", "type"], "state"],
      trend: false,
      styleOptions: { outline: true },
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: 72,
        temporal_resolution: "daily",
        spatial_resolution: "state",
      },
      id: "72",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-solid" },
      filter: ["==", ["get", "type"], "state"],
      trend: false,
      styleOptions: { outline: true },
    },
  ],
  "us-county": [
    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: 104,
        temporal_resolution: "daily",
        spatial_resolution: "county",
        fields: ["value", "place_fips"],
      },
      id: "104",
      featureLinkField: "place_fips",
      styleId: { fill: "metric-transp", circle: "metric-test-transp" },
      filter: ["==", ["get", "type"], "county"],
      trend: false,
      styleOptions: { outline: true },
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle-state"],
      params: {
        metric_id: 74,
        temporal_resolution: "daily",
        spatial_resolution: "state",
        fields: ["value", "date_time", "place_name", "place_id"],
        transform: get7dayAvg,
      },
      id: "104",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-transp" },
      filter: ["==", ["get", "type"], "state"],
      trend: false,
      styleOptions: { outline: true },
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle-state"],
      params: {
        metric_id: 72,
        temporal_resolution: "daily",
        spatial_resolution: "state",
      },
      id: "102",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-solid" },
      filter: ["==", ["get", "type"], "state"],
      trend: false,
      styleOptions: { outline: true },
    },
    {
      queryFunc: ObservationReduxQuery,
      for: ["circle"],
      params: {
        metric_id: 102,
        temporal_resolution: "daily",
        spatial_resolution: "county",
        fields: ["value", "place_fips"],
      },
      id: "102",
      featureLinkField: "place_fips",
      styleId: { fill: "metric-test", circle: "metric-test-solid" },
      filter: ["==", ["get", "type"], "county"],
      trend: false,
      styleOptions: { outline: true },
    },
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: PolicyStatusCounts,

      // params that must be passed to `queryFunc` as object
      params: {
        func: ({
          filters,
          policyResolution,
          mapId,
        }: PolicyCountsFuncArgs): Record<string, any> => {
          const countSub = policyResolution === PolicyResolution.subgeo;
          return {
            method: "post",
            filters,
            geo_res:
              mapId === "us-county" ? GeoRes.county : GeoRes.county_plus_state,
            count_sub: countSub,
            include_min_max: true,
            mapId,
          };
        },
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "policy_status_counts",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "policy_status_counts" },

      // filter to control what features are returned for layers that are
      // displaying this metric
      filter: ["==", ["get", "type"], "county"],

      // whether trend data should be retrieved for this metric
      // NOTE: only applies to generalized metrics
      trend: false,

      // info about layers that use this metric
      styleOptions: {
        // whether layers that display this metric should be outlined
        // NOTE: if true, an outline style must be defined in `./layers.js`
        outline: true,

        // whether layers that display this metric should have a pattern layers
        // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true
      },
    },
  ],
  get "us-county-plus-state"() {
    return this["us-county"];
  },
  global: [
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: DistancingLevel,

      // params that must be passed to `queryFunc` as object
      params: {
        func: ({
          filters,
          iso3,
        }: DistancingLevelFuncArgs): Record<string, any> => {
          return {
            method: "get",
            geo_res: GeoRes.country,
            date: filters.dates_in_effect[0],
            iso3,
          };
        },
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "lockdown_level",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "lockdown_level" },

      // // filter to control what features are returned for layers that are
      // // displaying this metric
      // filter: ["==", ["get", "type"], "state"],

      // whether trend data should be retrieved for this metric
      // NOTE: only applies to generalized metrics
      trend: false,

      // info about layers that use this metric
      styleOptions: {
        // whether layers that display this metric should be outlined
        // NOTE: if true, an outline style must be defined in `./layers.js`
        outline: true,

        // // whether layers that display this metric should have a pattern layers
        // // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true,
      },
    },
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: PolicyStatusCounts,

      // params that must be passed to `queryFunc` as object
      params: {
        func: ({
          filters,
          policyResolution,
          mapId,
        }: PolicyCountsFuncArgs): Record<string, any> => {
          const countSub = policyResolution === PolicyResolution.subgeo;
          return {
            method: "post",
            filters,
            geo_res: GeoRes.country,
            count_sub: countSub,
            include_min_max: true,
            mapId,
          };
        },
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "policy_status_counts",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "policy_status_counts" },

      // // filter to control what features are returned for layers that are
      // // displaying this metric
      // filter: ["==", ["get", "type"], "state"],

      // whether trend data should be retrieved for this metric
      // NOTE: only applies to generalized metrics
      trend: false,

      // info about layers that use this metric
      styleOptions: {
        // whether layers that display this metric should be outlined
        // NOTE: if true, an outline style must be defined in `./layers.js`
        outline: true,

        // whether layers that display this metric should have a pattern layers
        // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true
      },
    },

    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: "77",
        temporal_resolution: "daily",
        spatial_resolution: "country",
      },
      id: "77",
      filter: ["==", ["in", ["get", "ADM0_A3"], ["literal", ["PRI"]]], false],
      featureLinkField: "place_iso3",
      styleId: {
        fill: "metric-test",
        circle: "metric-test-transp-global",
      },
      trend: false,
      styleOptions: { outline: true, pattern: false },
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: "75",
        temporal_resolution: "daily",
        spatial_resolution: "country",
      },
      id: "75",
      filter: ["==", ["in", ["get", "ADM0_A3"], ["literal", ["PRI"]]], false],
      featureLinkField: "place_iso3",
      styleId: {
        fill: "metric-test",
        circle: "metric-test-solid-global",
      },
      trend: false,
      styleOptions: { outline: true, pattern: false },
    },
  ],
};

// get JSX for link to COVID-Local metrics page
const getCovidLocalMetricLink = (
  v: string,
  color: string = "",
  style: CSS.Properties = {}
): any => {
  return (
    <a
      style={{ color: color || "unset", ...style }}
      href={COVID_LOCAL_URL + "metrics/"}
      rel="noopener noreferrer"
      target="_blank"
      key={v}
      id={v}
    >
      {v}
    </a>
  );
};

// metric metadata used for display, tooltips, etc.
export const metricMeta: MetricMeta = {
  // unique ID of metric

  "74": {
    // metric definition
    metric_definition: (
      <span>
        The moving 7-day average number of new daily COVID-19 cases (confirmed
        and probable) in the state.
        <br />
        <i style={{ fontSize: ".8em" }}>
          Source: Calculated from{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/nytimes/covid-19-data"
          >
            New York Times compilation of data from state and local governments
            and health departments
          </a>
        </i>
      </span>
    ),

    // metric name displayed on front-end
    metric_displayname: "7-day average new cases",

    // Optional: Short name for metric where needed
    shortName: (
      <>
        <div>Cases</div>
        <div
          style={{
            fontFamily: "'rawline', serif",
            // fontSize: ".9em",
            fontWeight: "normal",
            fontStyle: "italic",
            lineHeight: "1.1",
          }}
        >
          confirmed & probable
        </div>
      </>
    ),

    // value formatter for metric
    value: (v: number): string => comma(v),

    // unit label formatter for metric
    unit: (): string => "7-day avg. daily cases",

    // if metric has trends, the label describing timeframe of those trends
    trendTimeframe: (
      <React.Fragment>
        over
        <br />
        prior 7 days
      </React.Fragment>
    ),

    // legend styling information
    legendInfo: {
      // when metric is used as a fill:
      fill: () => {
        return {
          // legend entry is for a basemap, or can be bubble
          for: "basemap",

          // the type of legend entry, e.g., quantized, ordinal, continous
          type: "quantized",

          // quantized legend `type` only: if true, labels go inside color rects,
          // otherwise below them
          labelsInside: true,

          // d3-esque color scale used to obtain legend labels and colors.
          // must implement these instance methods: domain, range
          colorscale: d3
            .scaleOrdinal()
            .domain(["no data", "under 25", "25 - 49", "50 - 74", "75 or more"])
            .range([noDataGray, "#BBDAF5", "#86BFEB", "#549FE2"]), // TODO dynamically

          // for non-quantized legend `type`: the labels that should be used for
          // each `for` category
          labels: {
            bubble: { min: "Low", max: "High" },
            basemap: { min: "Minimal", max: "High" },
          },
        };
      },
      // additional layer legend information...
      circle: {
        for: "bubble",
        type: "continuous",
        outline: "#e65d36",
        colorscale: d3
          .scaleLinear<string, number>()
          .domain([0, 100])
          .range(["transparent", "transparent"]), // TODO dynamically
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" },
        },
      },
    },
  },

  // additional metric legend information...
  get "72"() {
    return {
      ...this["74"],
      metric_displayname: "Cumulative cases",
      metric_definition: (
        <span>
          The total cumulative number of COVID-19 cases (confirmed and probable)
          in the state as of the indicated date
          <br />
          <i style={{ fontSize: ".8em" }}>
            Source:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/nytimes/covid-19-data"
            >
              New York Times compilation of data from state and local
              governments and health departments
            </a>
          </i>
        </span>
      ),
      unit: (v: number) => (v === 1 ? "total case" : "total cases"),
      trendTimeframe: (
        <React.Fragment>
          in last
          <br />
          24 hours
        </React.Fragment>
      ),
      // Optional: Short name for metric where needed
      shortName: (
        <>
          <div>Cases</div>
          <div
            style={{
              fontFamily: "'rawline', serif",
              // fontSize: ".9em",
              fontWeight: "normal",
              fontStyle: "italic",
              lineHeight: "1.1",
            }}
          >
            confirmed & probable
          </div>
        </>
      ),
      legendInfo: {
        ...this["74"].legendInfo,
        circle: {
          for: "bubble",
          type: "continuous",
          outline: "#e65d36",
          colorscale: d3
            .scaleLinear<string, number>()
            .domain([0, 100])
            .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
          labels: {
            bubble: { min: "Low", max: "High" },
            basemap: { min: "Minimal", max: "High" },
          },
        },
      },
    };
  },
  get "102"() {
    return {
      ...this["72"],
      metric_definition: (
        <span>
          The total cumulative number of COVID-19 cases (confirmed and probable)
          as of the indicated date
          <br />
          <i style={{ fontSize: ".8em" }}>
            Source:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/nytimes/covid-19-data"
            >
              New York Times compilation of data from state and local
              governments and health departments
            </a>
          </i>
        </span>
      ),
    };
  },
  get "104"() {
    return {
      ...this["74"],
      metric_definition: (
        <span>
          The moving 7-day average number of new daily COVID-19 cases (confirmed
          and probable).
          <br />
          <i style={{ fontSize: ".8em" }}>
            Source: Calculated from{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/nytimes/covid-19-data"
            >
              New York Times compilation of data from state and local
              governments and health departments
            </a>
          </i>
        </span>
      ),
    };
  },
  get "77"() {
    return {
      ...this["74"],
      metric_definition: (
        <span>
          The moving 7-day average number of new daily COVID-19 cases
          (confirmed) in the country.
          <br />
          <i style={{ fontSize: ".8em" }}>
            Source: Calculated from{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/CSSEGISandData/COVID-19"
            >
              COVID-19 Data Repository by the Center for Systems Science and
              Engineering (CSSE) at Johns Hopkins University
            </a>
          </i>
        </span>
      ),
      // Optional: Short name for metric where needed
      shortName: (
        <>
          <div>Cases</div>
          <div
            style={{
              fontFamily: "'rawline', serif",
              // fontSize: ".9em",
              fontWeight: "normal",
              fontStyle: "italic",
              lineHeight: "1.1",
            }}
          >
            confirmed cases
          </div>
        </>
      ),
    };
  },
  get "75"() {
    return {
      ...this["72"],
      // Optional: Short name for metric where needed
      shortName: (
        <>
          <div>Cases</div>
          <div
            style={{
              fontFamily: "'rawline', serif",
              // fontSize: ".9em",
              fontWeight: "normal",
              fontStyle: "italic",
              lineHeight: "1.1",
            }}
          >
            confirmed cases
          </div>
        </>
      ),
      metric_definition: (
        <span>
          The total cumulative number of COVID-19 cases (confirmed) in the
          country as of the indicated date
          <br />
          <i style={{ fontSize: ".8em" }}>
            Source:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/CSSEGISandData/COVID-19"
            >
              COVID-19 Data Repository by the Center for Systems Science and
              Engineering (CSSE) at Johns Hopkins University
            </a>
          </i>
        </span>
      ),
    };
  },
  policy_status_counts: {
    metric_definition: (
      <span>
        The number of policies at the specified resolution in effect with the
        given category / subcategories in the location on the specified date.
      </span>
    ),
    metric_displayname: "Relative policy count",
    value: (v: number): number => v,
    unit: (): string => "",
    legendInfo: {
      fill: (mapId: MapId, policyResolution: PolicyResolution) => {
        return {
          for: "basemap", // TODO dynamically
          type: "quantized",
          labelsInside: false,
          range: [
            noDataGray,
            "none",
            mapGreen6,
            mapGreen5,
            mapGreen4,
            mapGreen3,
            mapGreen2,
            mapGreen1,
          ],
          borders: [null, "2px solid gray", null, null, null, null, null, null],
          width: [null, null, 40, 40, 40, 40, 40, 40],
          entryStyles: [
            undefined,
            { marginLeft: 10 },
            { marginLeft: 20, marginRight: 0 },
            { marginRight: 0 },
            { marginRight: 0 },
            { marginRight: 0 },
            { marginRight: 0 },
            { marginRight: 0 },
          ],
          labelStyles: [
            undefined,
            undefined,
            { position: "absolute", top: 20 },
            undefined,
            undefined,
            undefined,
            undefined,
            { position: "absolute", top: 20 },
          ],
          domain: [
            <div style={{ fontSize: ".8em", lineHeight: 1.1 }}>
              {getNounFromPolicyResolution(mapId, policyResolution)} data
              <br />
              not available
            </div>,
            <div
              style={{
                color: "#333",
                fontSize: ".8em",
                lineHeight: 1.1,
              }}
            >
              No{" "}
              {getNounFromPolicyResolution(
                mapId,
                policyResolution
              ).toLowerCase()}
              -level
              <br />
              policies in effect
            </div>,
            "Fewest",
            "",
            "",
            "",
            "",
            "Most",
          ],
          subLabels: [],
        };
      },
    },
  },
  lockdown_level: {
    // last updated: 2020-06-24
    // MV via JK and GU
    valueStyling: {
      // "No restrictions": {
      //   label: "No active restrictions",
      //   phase: "",
      //   color: "#fff",
      //   bordered: true,
      //   // icon: phase1,
      //   def: (
      //     <span>
      //       No active social distancing policies with restrictions are in place
      //     </span>
      //   ),
      // },
      // "No policy": {
      //   label: "No policy",
      //   color: "#fff",
      //   bordered: true,
      //   border: "2px solid gray",
      //   def: (
      //     <span>
      //       No policies are in place for social distancing or face masks.
      //     </span>
      //   ),
      // },
      Lockdown: {
        label: "Lockdown",
        phase: "Phase I",
        color: "#2165a1",
        icon: phase1,
        def: (
          <span>
            Policies do not allow residents to leave their place of residence
            unless explicitly permitted to do so.
          </span>
        ),
      },
      "Stay at home": {
        label: "Stay-at-home",
        phase: "Phase II",
        color: "#549FE2",
        icon: phase2,
        def: (
          <span>
            Policies limit most in-person activities and social events.
          </span>
        ),
      },
      "Safer at home": {
        label: "Safer-at-home",
        phase: "Phase III",
        color: "#86BFEB",
        icon: phase3,
        def: (
          <span>
            Policies limit activities to those specifically permitted,
            encouraging extra precautions and retaining limits on mass
            gatherings.
          </span>
        ),
      },
      // TODO update this value
      "Partially open": {
        label: "Partially open",
        phase: "Phase IV",
        color: "#a8c4dc",
        icon: phase4,
        def: (
          <span>
            A majority of public restrictions on mass gatherings and
            non-essential businesses are lifted or expired, with some policies
            in place on private sector reopening, use of face coverings or
            adaptation and mitigation measures like enhanced cleaning protocols.
          </span>
        ),
      },
      Open: {
        label: "Open",
        color: "#e9f3fc",
        def: <span>No active restrictions are in place.</span>,
      },
      // TODO elegantly
      get "No restrictions"() {
        return { ...this["Open"], noLegendEntry: true };
      },
      get "New normal"() {
        return { ...this["Partially open"], noLegendEntry: true };
      },
    },
    wideDefinition: true,
    get metric_definition() {
      if (this.valueStyling === undefined) return null;
      const fillInfo = this.legendInfo.fill();
      const colorRange = fillInfo.range.slice(1, fillInfo.range.length);
      return (
        <div>
          <p className={infostyles.definitionHeader}>
            <span>
              The level of distancing in the location on the specified date.{" "}
            </span>
            <br />
            <a
              href={COVID_LOCAL_URL + "metrics/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img alt={"COVID Local logo"} src={localLogo} />
              <span>view metrics at COVID-Local</span>
            </a>
          </p>
          {
            <table className={infostyles.distancingLevelTable}>
              <tbody>
                {Object.values(this.valueStyling)
                  .filter(d => d.noLegendEntry !== true)
                  .map((d, i) => (
                    <tr key={d.label}>
                      <td>
                        <div
                          style={
                            !d.bordered
                              ? {
                                  backgroundColor: colorRange[i],
                                  color: isLightColor(colorRange[i])
                                    ? "#333"
                                    : "white",
                                }
                              : {
                                  backgroundImage: `url("${colorRange[i]}")`,
                                  backgroundPosition: "center",
                                  padding: "3px 10px",
                                  border: d.border,
                                  color: "#333",
                                }
                          }
                          className={infostyles.rect}
                        >
                          {d.label}
                        </div>
                      </td>
                      <td>
                        <div>{d.phase && d.phase}</div>
                      </td>
                      <td>{d.def}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          }
          {
            //   Object.values(this.valueStyling).map(d => (
            //   <div style={{ marginTop: "10px" }}>
            //     <span style={{ fontWeight: "bold", color: d.color }}>
            //       {d.label} {d.phase && <>({d.phase})</>}
            //     </span>
            //     : {d.def}
            //   </div>
            // ))
          }
        </div>
      );
    },
    metric_displayname: "Distancing level",
    value: (v: string): string => v,
    unit: (): string => "",
    // trendTimeframe: "over prior 24 hours",
    legendInfo: {
      fill: () => {
        return {
          for: "basemap", // TODO dynamically
          type: "quantized",
          layout: "grid",
          labelsInside: true,
          range: [
            noDataGray,
            // "#ffffff",
            "#2165a1",
            "#549FE2",
            "#86BFEB",
            "#BBDAF5",
            "#e9f3fc",
          ],
          gridTemplateColumns: "auto repeat(5, 1fr)",
          entryStyles: [
            // null,
            {
              width: "auto",
              marginRight: 20,
              rectStyles: { width: "auto" },
            },
            null,
            null,
            null,
            null,
            null,
          ],
          borders: [null, null, null, null, null, null],
          // borders: [null, "2px solid gray", null, null, null, null, null],
          domain: [
            <div style={{ fontSize: ".8em", lineHeight: 1.1 }}>
              data not
              <br />
              available
            </div>,
            // <div style={{ fontSize: ".8em", lineHeight: 1.1 }}>no policy</div>,
            getCovidLocalMetricLink("lockdown"),
            getCovidLocalMetricLink("stay-at-home"),
            getCovidLocalMetricLink("safer-at-home"),
            getCovidLocalMetricLink("partially open"),
            <div style={{ lineHeight: 1.1 }}>open</div>,
          ],
          // subLabels: [
          //   <span style={{ visibility: "hidden" }}>x</span>,
          //   getCovidLocalMetricLink("Phase I", "#661B3C", {
          //     fontStyle: "italic",
          //   }),
          //   getCovidLocalMetricLink("Phase II", "#C1272D", {
          //     fontStyle: "italic",
          //   }),
          //   getCovidLocalMetricLink("Phase III", "#D66B3E", {
          //     fontStyle: "italic",
          //   }),
          //   getCovidLocalMetricLink("Phase IV", "#ECBD62", {
          //     fontStyle: "italic",
          //   }),
          //   <span style={{ visibility: "hidden" }}>x</span>,
          // ],
          colorscale: d3
            .scaleOrdinal<string>()
            .domain([
              "no data",
              // "no policy",
              getCovidLocalMetricLink("lockdown (phase I)"),
              getCovidLocalMetricLink("stay-at-home (phase II)"),
              getCovidLocalMetricLink("safer-at-home (phase III)"),
              getCovidLocalMetricLink("partially open (phase IV)"),
              "open",
            ])
            .range([
              noDataGray as string, // TODO review imports for colors
              "#2165a1",
              "#549FE2",
              "#86BFEB",
              "#BBDAF5",
              "#e9f3fc",
            ]),
        };
      },
    },
  },
};

// /**
//  * Given the `mapId` of a map return the appropriate lower case noun for the
//  * geographic features shown in the map.
//  */
// function getMapNoun(mapId) {
//   switch (mapId) {
//     case "us":
//       return "state";
//     case "us-county":
//       return "county";
//     default:
//       return "national";
//   }
// }

/**
 * Given the `mapId` and resolution of policies to view (`geo` meaning
 * policies applicable to the visible geographic unit of the map, and `sub`
 * meaning policies applicable to those beneath it), returns the correct noun
 * to describe the policy level.
 */
function getNounFromPolicyResolution(
  mapId: MapId,
  policyResolution: PolicyResolution
): string {
  switch (mapId) {
    case "us":
      if (policyResolution !== PolicyResolution.subgeo) return "State";
      else return "Sub-state";
    case "us-county":
      return "County";
    case "us-county-plus-state":
      return "State + county";
    default:
      if (policyResolution !== PolicyResolution.subgeo) return "National";
      else return "Sub-national";
  }
}
