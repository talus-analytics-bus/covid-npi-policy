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
import dots from "./assets/images/dots.svg";
import styles from "./plugins.module.scss";

// utilities and local components
import { isEmpty, percentize } from "../../../misc/Util";
import { Table, ShowMore } from "../../../common";

// define default parameters for MapboxMap
const today = moment();
export const defaults = {
  // default map ID
  mapId: "us",

  // default date for map to start on
  date: "2020-03-16",
  // date: today.format("YYYY-MM-DD"),

  // min/max dates for date selection -- if there are none, then provide
  // `undefined` as value for each
  minMaxDate: {
    minDate: "2020-01-01",
    maxDate: "2021-03-01"
  },

  // defaults for map with ID `us`
  us: {
    // id of default circle metric
    circle: "-9999",
    // id of default fill metric
    fill: "policy_status",
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
    // {
    //   // functions that, when passed `params`, returns the data for the map
    //   // for this metric
    //   queryFunc: ObservationQuery,
    //
    //   // params that must be passed to `queryFunc` as object
    //   params: {
    //     metric_id: -9997,
    //     temporal_resolution: "daily",
    //     spatial_resolution: "state"
    //   },
    //
    //   // array of layer types for which this metric is used
    //   for: ["circle", "fill"],
    //
    //   // unique ID of this metric
    //   id: "-9997",
    //
    //   // data field with which to link metric to features;
    //   // features potentially linking to this metric must have an ID that
    //   // matches the value for this key for the datum
    //   featureLinkField: "place_name",
    //
    //   // OPTIONAL:
    //   // style IDs to use for the metric for each layer type -- if none are
    //   // defined, then the metric's ID will be used to look up the appropriate
    //   // style.
    //   styleId: { fill: "metric-test", circle: "metric-test-transp" },
    //
    //   // filter to control what features are returned for layers that are
    //   // displaying this metric
    //   filter: ["==", ["get", "type"], "state"],
    //
    //   // whether trend data should be retrieved for this metric
    //   // NOTE: only applies to generalized metrics
    //   trend: true,
    //
    //   // info about layers that use this metric
    //   styleOptions: {
    //     // whether layers that display this metric should be outlined
    //     // NOTE: if true, an outline style must be defined in `./layers.js`
    //     outline: true,
    //
    //     // whether layers that display this metric should have a pattern layers
    //     // NOTE: if true, a pattern style must be defined in `./layers.js`
    //     pattern: true
    //   }
    // },
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
      for: ["circle", "fill"],
      params: {
        metric_id: -9999,
        temporal_resolution: "daily",
        spatial_resolution: "state"
      },
      id: "-9999",
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
  "-9999": {
    // metric definition
    metric_definition: "Test definition",

    // metric name displayed on front-end
    metric_displayname: "New COVID-19 cases in past 7 days (notional)",

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
          .range(["rgba(230, 93, 54, 0.6)", "rgba(230, 93, 54, 0.6)"]), // TODO dynamically
        labels: {
          bubble: { min: "Low", max: "High" },
          basemap: { min: "Minimal", max: "High" }
        }
      }
    }
  },
  // additional metric legend information...
  get "-9997"() {
    return {
      ...this["-9999"],
      metric_displayname: "Test metric -9997",
      legendInfo: {
        ...this["-9999"].legendInfo,
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
          .domain(["no policy", "policy in place"])
          .range(["#eaeaea", "#14988C"])
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

  // // optional: filter results, if this is not being done on the back-end.
  // // if it is being done on the back end, comment out or delete the code below
  // if (!isEmpty(filters)) {
  //   // for each filter
  //   for (const [field, fieldFilters] of Object.entries(filters)) {
  //     // for each API request result
  //     for (const [k, v] of Object.entries(results)) {
  //       // if no filter values, continue
  //       if (fieldFilters === undefined || fieldFilters.length === 0) continue;
  //       // if only value is "all", continue
  //       else if (fieldFilters.length === 1 && fieldFilters[0] === "all")
  //         continue;
  //       // otherwise, only return values that contain a filter value (simple)
  //       else {
  //         results[k] = v.filter(d => {
  //           return fieldFilters.includes(d[field]);
  //         });
  //       }
  //     }
  //   }
  // }

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
    if (!include.includes(k) || k.includes("-trend") || v === null) continue;
    else {
      // get metric metadata
      const thisMetricMeta = metricMeta[k];

      // define basic tooltip item
      const item = {
        label: thisMetricMeta.metric_displayname,
        value: thisMetricMeta.value(v),
        unit: thisMetricMeta.unit(v)
      };

      // SPECIAL METRICS // -------------------------------------------------//
      if (k === "policy_status") {
        const apiDate = date.format("YYYY-MM-DD");
        // get relevant policy data
        const policies = await Policy({
          method: "post",
          filters: {
            area1: [d.properties.state_name],
            dates_in_effect: [apiDate, apiDate],
            primary_ph_measure: filters.primary_ph_measure,
            ph_measure_details: filters.ph_measure_details
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
        tooltip.actions =
          nPolicies > 0
            ? [
                <Link
                  key={"view"}
                  onClick={() => {
                    plugins.setInitDataFilters({
                      primary_ph_measure: filters.primary_ph_measure,
                      ph_measure_details: filters.ph_measure_details || [],
                      dates_in_effect: filters.dates_in_effect,
                      iso3: ["United States"],
                      area1: [d.properties.state_name],
                      level: ["State / Province"]
                    });
                  }}
                  to={{
                    pathname: "/"
                  }}
                >
                  <button>
                    View details for{" "}
                    {nPolicies === 1 ? "this" : `these ${comma(nPolicies)}`}{" "}
                    {nPolicies === 1 ? "policy" : "policies"}
                  </button>
                </Link>
              ]
            : [];
        tooltip.tooltipHeader.subtitle = (
          <span>
            {comma(nPolicies)} {nPolicies === 1 ? "policy" : "policies"} in
            place for <b>{filters.primary_ph_measure[0].toLowerCase()}</b> on{" "}
            {formattedDate}
          </span>
        );
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
      }

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

      if (k === "-9999") {
        item.unit = (
          <span>
            {item.unit}
            <br />
            in past 7 days
          </span>
        );
        tooltip.tooltipHeaderMetric = item;
        continue;
      } else {
        // add item to tooltip content
        tooltip.tooltipMainContent.push(item);
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
        <React.Fragment>
          <TableDrawer
            key={d.ph_measure_details}
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
