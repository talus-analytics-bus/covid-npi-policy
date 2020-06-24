/**
 * Define metrics, data sources, and metric metadata for use in Mapbox map
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// standard packages
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 3rd party packages
import * as d3 from "d3/dist/d3.min";
import classNames from "classnames";
import moment from "moment";

// utilities
import { comma } from "../../../misc/Util";

// queries
import ObservationQuery from "../../../misc/ObservationQuery.js";
import TrendQuery from "../../../misc/TrendQuery.js";
import { Policy, PolicyStatus, execute } from "../../../misc/Queries";

// assets and styles
import dots from "./assets/images/dots.png";
import styles from "./plugins.module.scss";

// utilities and local components
import { isEmpty, percentize } from "../../../misc/Util";
import { Table, ShowMore } from "../../../common";

// define default parameters for MapboxMap
const today = moment();
const yesterday = moment(today).subtract(1, "days");
export const defaults = {
  // default map ID
  mapId: "us",

  // default date for map to start on
  // date: "2020-06-18",
  date: yesterday.format("YYYY-MM-DD"),

  // min/max dates for date selection -- if there are none, then provide
  // `undefined` as value for each
  minMaxDate: {
    minDate: "2020-01-21",
    maxDate: yesterday.format("YYYY-MM-DD")
    // maxDate: "2021-03-01"
  },

  // defaults for map with ID `us`
  us: {
    // id of default circle metric
    circle: "74",
    // id of default fill metric
    fill: "lockdown_level",
    // base layer immediately behind which layers should be appended to map
    priorLayer: "state-points"
  },
  // defaults for additional maps...
  global: { circle: "25", fill: "25", priorLayer: "country-label" }
};

// define metrics to retrieve for each map
export const mapMetrics = {
  // map ID of map in which metrics are used
  us: [
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: PolicyStatus,

      // params that must be passed to `queryFunc` as object
      params: ({ filters }) => {
        const lockdownFilters = {
          ...filters,
          lockdown_level: ["lockdown_level"]
        };
        // delete lockdownFilters.primary_ph_measure;
        delete lockdownFilters.ph_measure_details;
        return { method: "post", filters: lockdownFilters, geo_res: "state" };
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

        // whether layers that display this metric should have a pattern layers
        // NOTE: if true, a pattern style must be defined in `./layers.js`
        pattern: true
      }
    },
    {
      // functions that, when passed `params`, returns the data for the map
      // for this metric
      queryFunc: PolicyStatus,

      // params that must be passed to `queryFunc` as object
      params: ({ filters }) => {
        return { method: "post", filters, geo_res: "state" };
      },

      // array of layer types for which this metric is used
      for: ["fill"],

      // unique ID of this metric
      id: "policy_status",

      // data field with which to link metric to features;
      // features potentially linking to this metric must have an ID that
      // matches the value for this key for the datum
      featureLinkField: "place_name",

      // OPTIONAL:
      // style IDs to use for the metric for each layer type -- if none are
      // defined, then the metric's ID will be used to look up the appropriate
      // style.
      styleId: { fill: "policy_status" },

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
        outline: true

        // whether layers that display this metric should have a pattern layers
        // NOTE: if true, a pattern style must be defined in `./layers.js`
        // pattern: true
      }
    },

    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: 74,
        temporal_resolution: "daily",
        spatial_resolution: "state"
      },
      id: "74",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-transp" },
      filter: ["==", ["get", "type"], "state"],
      trend: true,
      styleOptions: { outline: true, pattern: true }
    },
    {
      queryFunc: ObservationQuery,
      for: ["circle"],
      params: {
        metric_id: 72,
        temporal_resolution: "daily",
        spatial_resolution: "state"
      },
      id: "72",
      featureLinkField: "place_name",
      styleId: { fill: "metric-test", circle: "metric-test-solid" },
      filter: ["==", ["get", "type"], "state"],
      trend: true,
      styleOptions: { outline: true, pattern: true }
    }
  ],
  global: [
    {
      queryFunc: ObservationQuery,
      for: ["circle", "fill"],
      params: {
        metric_id: "25",
        temporal_resolution: "daily",
        spatial_resolution: "country"
      },
      id: "25",
      featureLinkField: "place_id",
      styleId: { fill: "metric-test", circle: "metric-test-solid" },
      trend: true,
      styleOptions: { outline: true, pattern: true }
    }
  ]
};

// metric metadata used for display, tooltips, etc.
export const metricMeta = {
  // unique ID of metric
  "74": {
    // metric definition
    metric_definition: (
      <span>
        The number of new COVID-19 cases in the state in the past 7 days.
        <br />
        <i style={{ fontSize: ".8rem" }}>
          Source: Calculated from{" "}
          <a target="_blank" href="https://github.com/nytimes/covid-19-data">
            New York Times compilation of data from state and local governments
            and health departments
          </a>
        </i>
      </span>
    ),

    // metric name displayed on front-end
    metric_displayname: "New COVID-19 cases in past 7 days",

    // value formatter for metric
    value: v => comma(v),

    // unit label formatter for metric
    unit: v => (v === 1 ? "new case" : "new cases"),

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
      fill: {
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
          .range(["#eaeaea", dots, "#BBDAF5", "#86BFEB", "#549FE2"]), // TODO dynamically

        // for non-quantized legend `type`: the labels that should be used for
        // each `for` category
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" }
        }
      },
      // additional layer legend information...
      circle: {
        for: "bubble",
        type: "continuous",
        outline: "#e65d36",
        colorscale: d3
          .scaleLinear()
          .domain([0, 100])
          .range(["transparent", "transparent"]), // TODO dynamically
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" }
        }
      }
    }
  },
  // additional metric legend information...
  get "72"() {
    return {
      ...this["74"],
      metric_displayname: "Cumulative caseload (up to date selected)",
      metric_definition: (
        <span>
          The total cumulative number of COVID-19 cases in the state as of the
          indicated date
          <br />
          <i style={{ fontSize: ".8rem" }}>
            Source:{" "}
            <a target="_blank" href="https://github.com/nytimes/covid-19-data">
              New York Times compilation of data from state and local
              governments and health departments
            </a>
          </i>
        </span>
      ),
      unit: v => (v === 1 ? "total case" : "total cases"),
      trendTimeframe: (
        <React.Fragment>
          in last
          <br />
          24 hours
        </React.Fragment>
      ),
      legendInfo: {
        ...this["74"].legendInfo,
        circle: {
          for: "bubble",
          type: "continuous",
          outline: "#e65d36",
          colorscale: d3
            .scaleLinear()
            .domain([0, 100])
            .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
          labels: {
            bubble: { min: "Low", max: "High" },
            basemap: { min: "Minimal", max: "High" }
          }
        }
      }
    };
  },
  "25": {
    metric_definition:
      "Number of new COVID-19 cases reported in the country on the specified date.",
    metric_displayname: "New COVID-19 cases on date",
    value: v => comma(v),
    unit: v => (v === 1 ? "new case" : "new cases"),
    trendTimeframe: "over prior 24 hours",
    legendInfo: {
      fill: {
        for: "basemap", // TODO dynamically
        type: "quantized",
        labelsInside: true,
        colorscale: d3
          .scaleOrdinal()
          .domain(["no data", "under 25", "25 - 49", "50 - 74", "75 or more"])
          .range(["#eaeaea", dots, "#BBDAF5", "#86BFEB", "#549FE2"]), // TODO dynamically
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" }
        }
      },
      circle: {
        for: "bubble",
        type: "continuous",
        outline: "#e65d36",
        colorscale: d3
          .scaleLinear()
          .domain([0, 100])
          .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" }
        }
      }
    }
  },
  policy_status: {
    metric_definition:
      "Status of the policy with the given category / subcategories on the specified date in the location.",
    metric_displayname: "Policy status",
    value: v => v,
    unit: v => "",
    // trendTimeframe: "over prior 24 hours",
    legendInfo: {
      fill: {
        for: "basemap", // TODO dynamically
        type: "quantized",
        labelsInside: true,
        colorscale: d3
          .scaleOrdinal()
          .domain(["no policy", "policy in effect"])
          .range(["#eaeaea", "#66CAC4"])
        // labels: {
        //   bubble: { min: "Low", max: "High" },
        //   basemap: { min: "Minimal", max: "High" }
        // }
      }
      // circle: {
      //   for: "bubble",
      //   type: "continuous",
      //   outline: "#e65d36",
      //   colorscale: d3
      //     .scaleLinear()
      //     .domain([0, 100])
      //     .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
      //   labels: {
      //     bubble: { min: "Low", max: "High" },
      //     basemap: { min: "Minimal", max: "High" }
      //   }
      // }
    }
  },
  lockdown_level: {
    // last updated: 2020-06-24
    // MV via JK and GU
    valueStyling: {
      Lockdown: {
        label: "Lockdown (Phase I)",
        color: "#2165a1",
        def: (
          <span>
            Policies do not allow residents to leave their place of residence
            unless explicitly permitted to do so.
          </span>
        )
      },
      "Stay at home": {
        label: "Stay-at-home (Phase II)",
        color: "#549FE2",
        def: (
          <span>
            Policies limit most in-person activities and social events.
          </span>
        )
      },
      "Safer at home": {
        label: "Safer-at-home (Phase III)",
        color: "#86BFEB",
        def: (
          <span>
            Policies limit activities to those specifically permitted,
            encouraging extra precautions and retaining limits on mass
            gatherings.
          </span>
        )
      },
      "New normal": {
        label: "New normal (Phase IV)",
        color: "#a8c4dc",
        def: (
          <span>
            A majority of public restrictions on mass gatherings and
            non-essential businesses are lifted or expired, with some
            encouraging of safeguards such as face coverings.
          </span>
        )
      },
      "Mixed distancing levels": {
        label: "Mixed distancing levels",
        color: "#a8c4dc",
        def: (
          <span>
            Any combination of the above levels simultaneously in effect.
          </span>
        )
      }
    },
    get metric_definition() {
      return (
        <div>
          The level of distancing in the location on the specified date.
          {Object.values(this.valueStyling).map(d => (
            <div style={{ marginTop: "10px" }}>
              <span style={{ fontWeight: "bold", color: d.color }}>
                {d.label}
              </span>
              : {d.def}
            </div>
          ))}
        </div>
      );
    },
    metric_displayname: "Distancing level",
    value: v => v,
    unit: v => "",
    // trendTimeframe: "over prior 24 hours",
    legendInfo: {
      fill: {
        for: "basemap", // TODO dynamically
        type: "quantized",
        labelsInside: true,
        colorscale: d3
          .scaleOrdinal()
          .domain([
            "no policy",
            "mixed",
            "new normal",
            "safer-at-home",
            "stay-at-home",
            "lockdown"
          ])
          .range(["#eaeaea", dots, "#BBDAF5", "#86BFEB", "#549FE2", "#2165a1"]) // TODO dynamically
        // .range(["#eaeaea", dots, "#BBDAF5", "#86BFEB", "#549FE2"]) // TODO dynamically
      }
      // circle: {
      //   for: "bubble",
      //   type: "continuous",
      //   outline: "#e65d36",
      //   colorscale: d3
      //     .scaleLinear()
      //     .domain([0, 100])
      //     .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
      //   labels: {
      //     bubble: { min: "Low", max: "High" },
      //     basemap: { min: "Minimal", max: "High" }
      //   }
      // }
    }
  }
};

/**
 * dataGetter
 * Given the date, map ID, and filters, obtains the data that should be joined
 * to the features on the map
 * @method dataGetter
 * @param  {[type]}   date    [description]
 * @param  {[type]}   mapId   [description]
 * @param  {[type]}   filters [description]
 * @param  {[type]}   map     [description]
 * @return {Promise}          [description]
 */
export const dataGetter = async ({ date, mapId, filters, map }) => {
  // get all metrics displayed in the current map
  const metrics = mapMetrics[mapId];

  // define date parameters for API calls
  const dates = {
    start_date: date.format("YYYY-MM-DD"),
    end_date: date.format("YYYY-MM-DD")
  };

  // collate query definitions based on the metrics that are to be displayed
  // for this map and whether those metrics will have trends displayed or not
  const queryDefs = {};
  metrics.forEach(d => {
    // if the query for this metric hasn't been defined yet, define it
    if (queryDefs[d.id] === undefined) {
      // parse query params
      const params =
        typeof d.params === "function"
          ? d.params({ date, mapId, filters, map })
          : d.params;

      // add base data query
      queryDefs[d.id] = {
        queryFunc: d.queryFunc,
        ...params,
        ...dates
      };

      // add trend query if applicable
      if (d.trend === true) {
        const trendKey = d.params.metric_id.toString() + "-trend";
        queryDefs[trendKey] = {
          queryFunc: TrendQuery,
          ...d.params,
          end: dates.end_date
        };
      }
    }
  });

  // collate queries in object to be called by the `execute method below`
  const queries = {};
  for (const [k, v] of Object.entries(queryDefs)) {
    queries[k] = v.queryFunc({
      ...v
    });
  }

  // execute queries in parallel
  const results = await execute({ queries });

  // return results
  return results;
};

/**
 * tooltipGetter
 * Given the current map ID, a datum `d`, the list of metric IDs to `include,
 * and the current date, return an object defining the tooltip header, content,
 * and actions that should be displayed in the `MapTooltip` component.
 * @method tooltipGetter
 * @param  {[type]}      mapId   [description]
 * @param  {[type]}      d       [description]
 * @param  {[type]}      include [description]
 * @param  {[type]}      date    [description]
 * @param  {[type]}      map     [description]
 * @return {Promise}             [description]
 */
export const tooltipGetter = async ({
  mapId,
  d,
  include,
  date,
  map,
  filters,
  plugins,
  callback
}) => {
  // define base tooltip data
  const tooltip = {
    tooltipHeader: null,
    tooltipMainContent: null,
    actions: null
  };

  // for each map type, return the appropriate tooltip formation
  const formattedDate = date.format("MMM D, YYYY");
  if (mapId === "us") {
    // get tooltip header
    tooltip.tooltipHeader = {
      title: d.properties.state_name,
      subtitle: formattedDate
    };
    // add actions for bottom of tooltip
    // tooltip.actions = [<button key={"view"}>View details</button>];
    tooltip.actions = [];
    tooltip.tooltipHeaderMetric = null;
  } else {
    // get tooltip header
    tooltip.tooltipHeader = {
      title: d.properties.NAME,
      subtitle: formattedDate
    };

    // add actions for bottom of tooltip
    tooltip.actions = [<button key={"view"}>View country</button>];
  }
  // get content from metric IDs / values in `state`
  tooltip.tooltipMainContent = [];

  // get the current feature state (the feature to be tooltipped)
  const state = map.getFeatureState(d);

  // for each metric (k) and value (v) defined in the feature state, if it is
  // on the list of metrics to `include` in the tooltip then add it to the
  // tooltip, otherwise skip
  for (const [k, v] of Object.entries(state)) {
    // skip metric unless it is to be included
    if (
      !include.includes(k) ||
      k.includes("-trend") ||
      v === "null" ||
      v === null ||
      v < 0
    )
      continue;
    else {
      // get metric metadata
      const thisMetricMeta = metricMeta[k];

      // define basic tooltip item
      const item = {
        label: thisMetricMeta.metric_displayname,
        value: thisMetricMeta.value(v),
        unit: thisMetricMeta.unit(v)
      };

      // TRENDS // ----------------------------------------------------------//
      // define standard trend key, e.g., "metric_name-trend"
      const trendKey = k + "-trend";

      // if there are trend data, get them, and define the visual
      // representation of the trend for the tooltip
      if (state[trendKey] !== undefined && state[trendKey] !== null) {
        // get pct 0..100 of the trend value
        const pct = state[trendKey];

        // get appropriate noun for trend direction
        let noun;
        if (pct < 0) noun = "decrease";
        else if (pct > 0) noun = "increase";
        else noun = "no change";

        // define the datum for visual representation of the trend
        item.trend = {
          pct,
          pct_fmt: (
            <span>
              <i className={classNames("material-icons")}>play_arrow</i>
              {percentize(state[trendKey]).replace("-", "")}
            </span>
          ),
          noun,
          timeframe: thisMetricMeta.trendTimeframe,
          classes: []
        };
      }

      if (k === "74") {
        item.unit = (
          <span>
            {item.unit}
            <br />
            in past 7 days
          </span>
        );
        tooltip.tooltipHeaderMetric = item;
        continue;
      } else if (k === "72") {
        item.unit = <span>{item.unit}</span>;
        tooltip.tooltipHeaderMetric = item;
        continue;
      } else {
        // add item to tooltip content
        tooltip.tooltipMainContent.push(item);
      }

      // SPECIAL METRICS // -------------------------------------------------//
      if (k === "policy_status" || k === "lockdown_level") {
        const apiDate = date.format("YYYY-MM-DD");
        // get relevant policy data
        const policies = await Policy({
          method: "post",
          filters: {
            area1: [d.properties.state_name],
            level: ["State / Province"],
            dates_in_effect: [apiDate, apiDate],

            // if doing distancing level, only allow all social distancing
            // policies to be returned
            primary_ph_measure:
              plugins.fill !== "lockdown_level"
                ? filters.primary_ph_measure
                : ["Social distancing"],
            ph_measure_details:
              plugins.fill !== "lockdown_level"
                ? filters.ph_measure_details
                : []
          },
          by_category: "ph_measure_details",
          fields: [
            "id",
            "primary_ph_measure",
            "ph_measure_details",
            "date_start_effective",
            "desc"
          ]
        });

        let nPolicies = 0;
        item.className = "policyStatus";
        const tables = [];
        for (const [ph_measure_details, policiesOfCategory] of Object.entries(
          policies.data
        )) {
          const rows = [];
          policiesOfCategory.forEach(d => {
            rows.push(d);
          });
          tables.push({ ph_measure_details, rows });
          nPolicies += policiesOfCategory.length;
        }

        // add actions for bottom of tooltip
        const filtersStr = JSON.stringify({
          primary_ph_measure:
            plugins.fill !== "lockdown_level"
              ? filters.primary_ph_measure
              : ["Social distancing"],
          ph_measure_details:
            plugins.fill !== "lockdown_level"
              ? filters.ph_measure_details || []
              : [],
          dates_in_effect: filters.dates_in_effect,
          country_name: ["United States of America (USA)"],
          area1: [d.properties.state_name],
          level: ["State / Province"]
        });
        tooltip.actions =
          nPolicies > 0
            ? [
                <a target="_blank" href={"/data?filters=" + filtersStr}>
                  <button>
                    View details for{" "}
                    {nPolicies === 1 ? "this" : `these ${comma(nPolicies)}`}{" "}
                    {nPolicies === 1 ? "policy" : "policies"}
                  </button>
                </a>
                // <Link
                //   key={"view"}
                //   onClick={() => {
                //     plugins.setInitDataFilters({
                //       // if doing distancing level, only allow all social distancing
                //       // policies to be returned
                //       primary_ph_measure:
                //         plugins.fill !== "lockdown_level"
                //           ? filters.primary_ph_measure
                //           : ["Social distancing"],
                //       ph_measure_details:
                //         plugins.fill !== "lockdown_level"
                //           ? filters.ph_measure_details || []
                //           : [],
                //       dates_in_effect: filters.dates_in_effect,
                //       country_name: ["United States of America (USA)"],
                //       area1: [d.properties.state_name],
                //       level: ["State / Province"]
                //     });
                //   }}
                //   to={{
                //     pathname: "/data"
                //   }}
                // >
                //   <button>
                //     View details for{" "}
                //     {nPolicies === 1 ? "this" : `these ${comma(nPolicies)}`}{" "}
                //     {nPolicies === 1 ? "policy" : "policies"}
                //   </button>
                // </Link>
              ]
            : [];

        const subtitleCategory =
          plugins.fill !== "lockdown_level"
            ? filters.primary_ph_measure[0].toLowerCase()
            : "social distancing";
        const displayInfo = metricMeta.lockdown_level.valueStyling[v];
        const subtitle = (
          <span>
            {plugins.fill === "lockdown_level" && (
              <span>
                <b style={{ color: displayInfo.color }}>{displayInfo.label}</b>{" "}
                with{" "}
              </span>
            )}
            {comma(nPolicies)} {nPolicies === 1 ? "policy" : "policies"} in
            effect for <b>{subtitleCategory}</b> on {formattedDate}
          </span>
        );
        tooltip.tooltipHeader.subtitle = subtitle;
        item.customContent = (
          <TableDrawers
            {...{ tables, geometryName: d.properties.state_name }}
          />
        );

        item.value = (
          <div
            className={styles.badge}
            style={{
              backgroundColor: metricMeta[k].legendInfo.fill.colorscale(v)
            }}
          >
            {thisMetricMeta.value(v)}
          </div>
        );

        // if no policies returned, then make main content empty
        if (nPolicies === 0) {
          tooltip.tooltipMainContent = [];
        }
      }
    }
  }
  if (callback) callback();
  return tooltip;
};
const TableDrawer = ({
  header,
  id,
  open,
  openTableDrawer,
  setOpenTableDrawer,
  children
}) => {
  return (
    <div className={styles.tableDrawer}>
      <div
        onClick={() => {
          if (open) setOpenTableDrawer(null);
          else setOpenTableDrawer(id);
        }}
        className={styles.header}
      >
        {header}
        <button>
          {
            <i
              className={classNames("material-icons", {
                [styles.flipped]: open
              })}
            >
              play_arrow
            </i>
          }
        </button>
      </div>
      <div className={styles.content}>{open && children}</div>
    </div>
  );
};
const TableDrawers = ({ tables, geometryName, ...props }) => {
  const [openTableDrawer, setOpenTableDrawer] = useState(null);
  useEffect(() => {
    if (tables[0] !== undefined)
      setOpenTableDrawer(tables[0].ph_measure_details);
  }, [tables]);

  return (
    <div className={styles.table}>
      {tables.map((d, i) => (
        <React.Fragment
          key={d.ph_measure_details + "-" + geometryName + "-" + i}
        >
          <TableDrawer
            id={d.ph_measure_details}
            open={d.ph_measure_details === openTableDrawer}
            openTableDrawer={openTableDrawer}
            setOpenTableDrawer={setOpenTableDrawer}
            header={
              <div className={styles.tableName}>
                {d.ph_measure_details}{" "}
                <span className={styles.num}>
                  ({comma(d.rows.length)}
                  {d.rows.length === 1 ? " policy" : " policies"})
                </span>
              </div>
            }
          >
            <span className={styles.instructions}>Scroll to view more</span>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Effective start date</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((dd, ii) => (
                  <tr key={dd.desc + " - " + ii}>
                    <td>
                      <ShowMore {...{ text: dd.desc, charLimit: 100 }} />
                    </td>
                    <td>
                      {moment(dd.date_start_effective).format(`MMM D, 'YY`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableDrawer>
        </React.Fragment>
      ))}
    </div>
  );
};
