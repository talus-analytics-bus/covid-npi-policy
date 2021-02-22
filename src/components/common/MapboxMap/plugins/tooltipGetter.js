import React from "react";
import classNames from "classnames";
import { Policy } from "../../../misc/Queries";
import infostyles from "../../../common/InfoTooltip/plugins.module.scss";
import styles from "../../../common/MapboxMap/mapTooltip/maptooltip.module.scss";
import localLogo from "./assets/icons/logo-local-pill.png";
import { percentize } from "../../../misc/Util";
import { PrimaryButton } from "../../../common";
import { metricMeta, COVID_LOCAL_URL } from "./data";

// // packages for qualitative value binning
// import * as d3 from "d3/dist/d3.min";
// import { comma } from "../../../misc/Util";

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
  setMapId,
  d,
  include,
  date,
  data,
  map,
  filters,
  plugins,
  callback,
  ...props
}) => {
  // define base tooltip data
  const tooltip = {
    tooltipHeader: null,
    tooltipMainContent: null,
    actions: null,
  };
  // for each map type, return the appropriate tooltip formation
  const formattedDate = date.format("MMM D, YYYY");
  if (mapId === "us") {
    // get tooltip header
    tooltip.tooltipHeader = {
      title: d.properties.state_name,
      subtitle: null,
    };
  } else {
    // get tooltip header
    // find place match or use geo properties
    const matchingPlace = plugins.places.find(
      dd => dd.iso === d.properties.ISO_A3
    );
    if (matchingPlace) {
      tooltip.tooltipHeader = {
        title: matchingPlace.name,
        subtitle: null,
      };
    } else {
      tooltip.tooltipHeader = {
        title: d.properties.NAME,
        subtitle: null,
      };
    }
  }
  tooltip.actions = [];
  tooltip.tooltipHeaderMetric = null;

  // get content from metric IDs / values in `state`
  tooltip.tooltipMainContent = [];

  // get the current feature state (the feature to be tooltipped)
  const state = map.getFeatureState(d);

  // if lockdown level is null, set to "Open"
  const replaceNullsWithOpen =
    state.lockdown_level === null && (props.geoHaveData || mapId === "us");
  if (replaceNullsWithOpen) state.lockdown_level = "Open";

  const apiDate = date.format("YYYY-MM-DD");

  // get relevant policy data
  const policyFilters = {
    level: mapId === "us" ? ["State / Province"] : ["Country"],
    dates_in_effect: [apiDate, apiDate],

    // if doing distancing level, only allow all social distancing
    // policies to be returned
    primary_ph_measure:
      plugins.fill !== "lockdown_level"
        ? filters.primary_ph_measure
        : ["Social distancing"],
  };
  if (
    plugins.fill !== "lockdown_level" &&
    filters.ph_measure_details !== undefined &&
    filters.ph_measure_details.length > 0
  ) {
    policyFilters.ph_measure_details = filters.ph_measure_details;
  }
  if (mapId === "us") {
    policyFilters.area1 = [d.properties.state_name];
    // add US to country name if in USA map
    policyFilters.iso3 = ["USA"];
  } else policyFilters.iso3 = [d.properties.ISO_A3];

  // for each metric (k) and value (v) defined in the feature state, if it is
  // on the list of metrics to `include` in the tooltip then add it to the
  // tooltip, otherwise skip
  for (const [k, v] of Object.entries(state)) {
    const badValue = v === "null" || v === null || v < 0;
    const isTrend = k.includes("-trend");
    const isOmitted = !include.includes(k);
    const isNotOnMap = k !== plugins.fill && k !== plugins.circle;
    const skipMetric = isOmitted || isNotOnMap || isTrend || badValue;

    // skip metric unless it is to be included
    if (skipMetric) continue;
    else {
      // get metric metadata
      const thisMetricMeta = metricMeta[k];

      // define basic tooltip item
      const item = {
        label: thisMetricMeta.shortName || thisMetricMeta.metric_displayname,
        value: thisMetricMeta.value(v),
        unit: thisMetricMeta.unit(v),
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
        item.trendData = {
          pct,
          pct_fmt: (
            <span>
              <i className={classNames("material-icons")}>play_arrow</i>
              {percentize(state[trendKey]).replace("-", "")}
            </span>
          ),
          noun,
          timeframe: thisMetricMeta.trendTimeframe,
          classes: [],
        };
      }

      // define special tooltip items
      if (k === "lockdown_level") {
        // if (v === "No restrictions") continue;
        const valueStyling = thisMetricMeta.valueStyling[v];
        if (valueStyling === undefined)
          console.error("Missing value styling for value: " + v);
        const label = valueStyling.labelShort || valueStyling.label;
        item.value = (
          <div className={styles[k]}>
            <div className={styles.icon}>
              {valueStyling.icon && (
                <img
                  alt={"Icon denoting a distancing level of " + label}
                  src={valueStyling.icon}
                />
              )}
              <div>{label}</div>
            </div>
            <div className={styles.footer}>
              <a
                href={COVID_LOCAL_URL + "metrics/"}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img alt={"The COVID Local logo"} src={localLogo} />
                <span>{valueStyling.phase} (view in COVID-Local)</span>
              </a>
            </div>
          </div>
        );
      } else if (["72", "74", "75", "77"].includes(k)) {
        item.value = (
          <div className={styles[k]}>
            <div className={styles.value}>
              <div className={styles.number}>{item.value}</div>
              <div className={styles.unit}>{thisMetricMeta.unit(v)}</div>
            </div>
            {item.trendData && (
              <div
                className={classNames(
                  styles.trend,
                  ...item.trendData.classes.map(d => styles[d])
                )}
              >
                <div
                  className={classNames(
                    styles.sentiment,
                    styles[item.trendData.noun.replace(" ", "-")]
                  )}
                >
                  {item.trendData.pct !== 0 && (
                    <span>{item.trendData.pct_fmt}&nbsp;</span>
                  )}
                </div>{" "}
                <div>
                  {item.trendData.noun} {item.trendData.timeframe}
                </div>
              </div>
            )}
          </div>
        );
      }

      item.customContent = (
        <>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.value}>{item.value}</div>
        </>
      );
      tooltip.tooltipMainContent.push(item);

      // SPECIAL METRICS // -------------------------------------------------//
      const fillInfo = metricMeta[k].legendInfo.fill();
      item.value = (
        <div
          className={infostyles.badge}
          style={{
            backgroundColor: fillInfo.colorscale(v),
          }}
        >
          {thisMetricMeta.value(v)}
        </div>
      );
    }
  }
  // define right content of header metric based on metric type
  // add actions for bottom of tooltip
  const filtersForStr = {
    level: mapId === "us" ? ["State / Province"] : ["Country"],
    primary_ph_measure:
      plugins.fill !== "lockdown_level"
        ? filters.primary_ph_measure
        : ["Social distancing"],
    ph_measure_details:
      plugins.fill !== "lockdown_level"
        ? filters.ph_measure_details || []
        : undefined,
    dates_in_effect: [apiDate, apiDate],
  };

  if (mapId === "us") {
    filtersForStr.country_name = ["United States of America (USA)"];
    filtersForStr.area1 = [d.properties.state_name];
    filtersForStr.iso3 = "USA";
  } else {
    // find place match
    const matchingPlace = plugins.places.find(
      dd => dd.iso === d.properties.ISO_A3
    );
    if (matchingPlace) {
      filtersForStr.country_name = [
        `${matchingPlace.name} (${matchingPlace.iso})`,
      ];
      filtersForStr.iso3 = [matchingPlace.iso];
    } else {
      filtersForStr.country_name = [
        `${d.properties.NAME} (${d.properties.ISO_A3})`,
      ];
      filtersForStr.iso3 = [d.properties.ISO_A3];
    }
  }

  // show "view state-level map" button?
  const isUsaOnGlobalMap = mapId === "global" && d.properties.ISO_A3 === "USA";
  const isUsaMap = mapId === "us";

  const hasPolicies =
    d.state.policy_status_counts !== null && d.state.policy_status_counts > 0;

  // content for right side of header
  tooltip.tooltipHeaderRight = (
    <>
      {(hasPolicies || mapId === "us") && (
        <div className={styles.buttonsVertical}>
          {isUsaOnGlobalMap && (
            <PrimaryButton
              {...{
                key: "to_us",
                onClick: () => setMapId("us"),
                iconName: "zoom_in",
                label: "view state-level map",
              }}
            />
          )}
          {mapId === "us" && (
            <PrimaryButton
              {...{
                key: "to_model",
                url: "/model/#" + d.properties.state_abbrev.toUpperCase(),
                iconName: "bar_chart",
                label: "view in model",
                urlIsExternal: true,
                isSecondary: false,
              }}
            />
          )}
          {!isUsaOnGlobalMap && hasPolicies && (
            <PrimaryButton
              {...{
                key: "to_data",
                // url: "/data?type=policy&filters_policy=" + filtersStr,
                url:
                  `/policies/` +
                  `${filtersForStr.iso3}/` +
                  `${
                    filtersForStr.iso3 === "USA"
                      ? filtersForStr.area1
                      : "national"
                  }`,
                iconName: "table_view",
                label: "view policies",
                urlIsExternal: true,
                isSecondary: isUsaOnGlobalMap || isUsaMap,
              }}
            />
          )}
        </div>
      )}
    </>
  );
  const nPolicies = {
    total: 0,
  };
  const noun = mapId === "us" ? "state" : "national";

  if (hasPolicies || mapId === "us") {
    // if (props.geoHaveData || mapId === "us") {
    const policies = await Policy({
      method: "post",
      filters: policyFilters,
      fields: ["id", "place"],
      count: true,
    });
    nPolicies.total = policies.data[0].n;
    // policies.data.forEach(d => {
    //   nPolicies.total += 1;
    //   switch (d.place.level) {
    //     case "Local":
    //       nPolicies.local += 1;
    //       break;
    //     case "State / Province":
    //       nPolicies.state += 1;
    //       break;
    //     case "Country":
    //       nPolicies.country += 1;
    //       break;
    //   }
    // });
    // // determine qualitative label to use for relative policy count
    // const useQual = true;
    // const maxVal = d3.max(data.policy_status_counts, d => d.value);
    // const minVal = d3.min(data.policy_status_counts, d => d.value);
    // const diff = maxVal - minVal;
    // const binSize = diff / 5;
    // const breakpoints = [1, 2, 3, 4].map(d => {
    //   return binSize * d + minVal;
    // });
    // const labels = ["Fewest", "Some", "Some", "Some", "Most"];
    // const qualValScale = d3
    //   .scaleThreshold()
    //   .domain(breakpoints)
    //   .range(labels);
    // const getQualVal = v => {
    //   if (v === 0) return "No";
    //   else return qualValScale(v);
    // };

    // define tooltip subtitle with date
    tooltip.tooltipHeader.subtitle = <span> as of {formattedDate}</span>;

    //  // define tooltip subtitle including policy count
    // const value = useQual
    //   ? getQualVal(nPolicies.total)
    //   : comma(nPolicies.total);
    //  tooltip.tooltipHeader.subtitle = (
    //    <>
    //      <span>
    //        {value} {noun}-level{" "}
    //        {nPolicies.total === 1 && !useQual
    //          ? "policy"
    //          : "policies"}{" "}
    //        in effect
    //      </span>
    //      <br />
    //      <span> as of {formattedDate}</span>
    //    </>
    //  );
  }

  // special -- add note if policy data not yet collected
  // TODO rewrite the block below for clarity
  let message;
  if (state.lockdown_level === null && mapId === "us") {
    if (nPolicies !== undefined && nPolicies.total > 0) {
      message = (
        <i>
          No {noun}-level distancing
          <br />
          level could be determined
          <br />
          from policies in effect
        </i>
      );
    } else {
      message = <i>No {noun}-level policies in effect</i>;
    }

    tooltip.tooltipMainContent.push({
      customContent: (
        <>
          <div className={styles.label}>Distancing level</div>
          <div style={{ color: "gray" }} className={styles.value}>
            {message}
          </div>
        </>
      ),
    });
  } else if (
    (state.lockdown_level === null || props.geoHaveData === false) &&
    mapId === "global"
  ) {
    let message;
    if (props.geoHaveData === false) {
      message = (
        <i>
          No policies yet available,
          <br />
          data collection in progress
        </i>
      );
    } else if (
      state.lockdown_level === null &&
      nPolicies !== undefined &&
      nPolicies.total > 0
    ) {
      message = (
        <i>
          No national-level distancing
          <br />
          level could be determined
          <br />
          from policies in effect
        </i>
      );
    } else {
      message = <i>No {noun}-level policies in effect</i>;
    }
    if (state.lockdown_level === null)
      tooltip.tooltipMainContent.push({
        customContent: (
          <>
            <div className={styles.label}>Distancing level</div>
            <div style={{ color: "gray" }} className={styles.value}>
              {message}
            </div>
          </>
        ),
      });
  }

  tooltip.tooltipMainContent.reverse();
  if (callback) callback();
  return tooltip;
};