/**
 * Page for a Mapbox map and related controls.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// standard packages
import React, { useEffect, useState } from "react";

// 3rd party packages
import moment from "moment";

// local packages
import {
  defaults,
  mapMetrics,
  metricMeta,
} from "../../common/MapboxMap/plugins/data";
import { mapStyles } from "../../common/MapboxMap/plugins/sources";
import { getInitLower } from "../../misc/Util";
// queries
import {
  OptionSet,
  CountriesWithDistancingLevels,
  execute,
} from "../../misc/Queries";
import PlaceQuery from "../../misc/PlaceQuery";

// assets and styles
import styles, { style, dark } from "./map.module.scss";

// common components
import {
  MapboxMap,
  RadioToggle,
  DateSlider,
  FilterSet,
  InfoTooltip,
  OptionsMenu,
} from "../../common";

// FUNCTION COMPONENT // ----------------------------------------------------//

const Map = ({ setLoading, setPage, versions, ...props }) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // map circle scale linear? otherwise log
  const [linCircleScale] = useState(true);

  // unique ID of map to display, e.g., 'us', 'global'
  const [mapId, setMapId] = useState(defaults.mapId);

  // whether to show policies at the selected geo or below it
  const [policyResolution, setPolicyResolution] = useState("geo");

  // default date of the map viewer -- `defaults.date` must be YYYY-MM-DD str
  const casesLastUpdated =
    mapId === "us"
      ? versions.find(d => d.name === "COVID-19 case data")
      : versions.find(d => d.name === "COVID-19 case data (countries)");
  const casesLastUpdatedDate = casesLastUpdated
    ? moment(casesLastUpdated.last_datum_date)
    : moment();
  defaults.minMaxDate.maxDate = casesLastUpdatedDate;
  const [date, setDate] = useState(casesLastUpdatedDate);
  // const [date, setDate] = useState(new moment(defaults.date));

  // name of metric to use as fill by default
  const [fill, setFill] = useState(defaults[mapId].fill);

  // name of metric to use as circle by default
  const [circle, setCircle] = useState(defaults[mapId].circle);

  // dynamic map title
  const getMapTitle = ({ fill, circle, mapId }) => {
    let title = "";
    const useAltTitles = true;
    if (useAltTitles) {
      title = "COVID-19";
      if (fill === "lockdown_level") {
        title += " distancing levels";
      } else if (fill === "policy_status_counts") {
        title += " mitigation policies";
      }
      if (circle !== null) {
        title += " and cases";
      }
      return title;
    } else {
      if (fill !== null) {
        title += metricMeta[fill].metric_displayname;
      }
      if (circle !== null) {
        title += ` and ${getInitLower(metricMeta[circle].metric_displayname)}`;
      }
      return title;
      // return title + ` at ${level} level`;
    }
  };
  const [mapTitle, setMapTitle] = useState("");

  // list of ISO3 codes of countries for which distancing levels are available
  const [geoHaveData, setGeoHaveData] = useState(null);

  // definition data for filters to display in drawer content section
  const [filterDefs, setFilterDefs] = useState([
    {
      // name of filter (should match `field` below)
      primary_ph_measure: {
        // data field
        field: "primary_ph_measure",

        // entity
        entity_name: "Policy",

        // display label
        label: "Policy category",

        // true if radio button selection, false if dropdown
        // if radio is true, must also define defaultRadioValue
        radio: true,

        // default value of radio selections
        defaultRadioValue: "Social distancing",
      },

      // additional filters
      ph_measure_details: {
        field: "ph_measure_details",
        label: "Policy subcategory filter",
        radio: false,
        primary: "primary_ph_measure",
        entity_name: "Policy",
        className: dark,
      },
    },
  ]);

  // currently selected filters
  const [filters, setFilters] = useState({
    primary_ph_measure: ["Social distancing"],
  });

  // country data for tooltip names
  const [places, setPlaces] = useState(null);

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  /**
   * Get data for page
   * @method getData
   * @param  {Object}  [filters={}] [description]
   * @return {Promise}              [description]
   */
  const getData = async (filters = {}) => {
    const queries = {};
    // get all country places for tooltip names, etc.
    queries.places = PlaceQuery({ place_type: ["country"] });

    queries.optionsets = OptionSet({
      method: "get",
      fields: filterDefs
        .map(d => Object.values(d).map(dd => dd))
        .flat()
        .filter(d => !d.field.startsWith("date") && d.items === undefined)
        .map(d => {
          return d.entity_name + "." + d.field;
        }),
      class_name: "Policy",
    });
    queries.countriesWithDistancingLevels = CountriesWithDistancingLevels();

    const results = await execute({
      queries,
    });

    // if page is first initializing, also retrieve filter optionset values for
    // non-date filters
    const optionsets = results["optionsets"];

    // set options for filters
    const newFilterDefs = [...filterDefs];
    newFilterDefs.forEach(d => {
      for (const [k] of Object.entries(d)) {
        if (!k.startsWith("date") && d[k].items === undefined)
          d[k].items = optionsets[k];
      }
    });
    setPlaces(results.places);
    setFilterDefs(newFilterDefs);
    setGeoHaveData(results.countriesWithDistancingLevels);
    setInitialized(true);
    setLoading(false);
  };

  // CONSTANTS // -----------------------------------------------------------//
  // Label for "View [xxx] by" radio button set
  const viewLabel = `View ${mapId === "us" ? "states" : "countries"} by`;

  // last updated date of overall data
  const lastUpdatedDateOverall = versions.filter(d => {
    if (d.name === "COVID-19 case data (countries)" && mapId === "us") {
      return false;
    } else if (d.name === "COVID-19 case data" && mapId === "global") {
      return false;
    } else return true;
  })[0].date;

  // define arrow icon for open/close toggle icons in map overlays
  const arrow = <i className={"material-icons"}>play_arrow</i>;

  // collate mapbox component for the currently enabled maps
  // for each map defined in `mapStyles` (see ./plugins/sources.js):
  const maps = [];
  for (const [k] of Object.entries(mapStyles)) {
    // add the mapbox map component for the map to the array as long as it is
    // the currently enabled map
    maps.push(
      k === mapId && (
        <MapboxMap
          {...{
            setInfoTooltipContent: props.setInfoTooltipContent,
            mapId: k,
            setMapId,
            linCircleScale,
            key: k,
            mapStyle: mapStyles[k],
            date,
            circle,
            fill,
            filters,
            geoHaveData,
            overlays: (
              <>
                <div className={styles.mapBanner}>
                  <div className={styles.title}>{mapTitle}</div>
                  <div className={styles.dates}>
                    <div className={styles.primary}>
                      Data for {date.format("MMM D, YYYY")}
                    </div>
                    <div className={styles.secondary}>
                      Data last updated on{" "}
                      {moment(lastUpdatedDateOverall).format("MMM D, YYYY")}
                      <InfoTooltip
                        place={"left"}
                        text={
                          <div>
                            {versions
                              .filter(d => {
                                if (
                                  d.name === "COVID-19 case data (countries)" &&
                                  mapId === "us"
                                ) {
                                  return false;
                                } else if (
                                  d.name === "COVID-19 case data" &&
                                  mapId === "global"
                                ) {
                                  return false;
                                } else return true;
                              })
                              .map(d => (
                                <p key={d.name}>
                                  <b>{d.name}</b> last updated on{" "}
                                  {moment(d.date).format("MMM D, YYYY")}
                                  {d.last_datum_date !== null && (
                                    <span>
                                      {" "}
                                      with data available through{" "}
                                      {moment(d.last_datum_date).format(
                                        "MMM D, YYYY"
                                      )}
                                    </span>
                                  )}
                                </p>
                              ))}
                          </div>
                        }
                        setInfoTooltipContent={props.setInfoTooltipContent}
                      />
                    </div>
                  </div>
                </div>
                {
                  <OptionsMenu
                    {...{
                      allowDesktop: false,
                      defaultOpen: true,
                      toggleText: open =>
                        open ? (
                          <span>
                            <span>hide options</span>
                            {arrow}
                          </span>
                        ) : (
                          <span>
                            <span>show options</span>
                            {arrow}
                          </span>
                        ),
                      content: [
                        <div className={styles.mapOptionsTitle}>
                          Map options
                        </div>,
                        <MapIdToggle
                          setInfoTooltipContent={props.setInfoTooltipContent}
                          {...{
                            mapId,
                            setMapId,
                            policyResolution,
                            setPolicyResolution,
                            fill,
                          }}
                        />,
                        <>
                          {[
                            // fill metric radio toggle
                            fill !== null && (
                              <RadioToggle
                                {...{
                                  // TODO define choices based on current mapType
                                  setInfoTooltipContent:
                                    props.setInfoTooltipContent,
                                  tooltipPlace: "left",
                                  choices: mapMetrics[mapId]
                                    .filter(d => d.for.includes("fill"))
                                    .map(d => {
                                      return {
                                        value: d.id,
                                        name:
                                          metricMeta[d.id].metric_displayname,
                                        wideTooltip: d.id === "lockdown_level",
                                        tooltip:
                                          metricMeta[d.id].metric_definition,
                                      };
                                    }),
                                  curVal: fill,
                                  callback: setFill,
                                  label: viewLabel,
                                  key: "DataType",
                                }}
                              />
                            ),
                            // Filter set containing the filters specified in `filterDefs`
                            <>
                              {(fill === "policy_status" ||
                                fill === "policy_status_counts") && (
                                <div className={styles.indented}>
                                  <FilterSet
                                    {...{
                                      filterDefs,
                                      filters,
                                      setFilters,
                                      // if true, the selected filters bay will show
                                      // TODO style selected filters bay
                                      showSelectedFilters: false,
                                      vertical: true,
                                      key: "FilterSet",
                                    }}
                                  />
                                </div>
                              )}
                            </>,

                            // circle metric radio toggle
                            <div className={styles.circleToggle}>
                              <label>COVID-19 cases</label>
                              <div
                                onChange={e => {
                                  setCircle(
                                    e.target.value === "show"
                                      ? defaults[mapId].circle
                                      : null
                                  );
                                }}
                              >
                                <label>
                                  <input
                                    type="radio"
                                    value="show"
                                    name="casecount"
                                    defaultChecked
                                  />{" "}
                                  <span>Show</span>
                                </label>
                                <br />
                                <label>
                                  <input
                                    type="radio"
                                    value="hide"
                                    name="casecount"
                                  />{" "}
                                  <span>Hide</span>
                                </label>
                              </div>

                              {circle !== null && (
                                <>
                                  <div className={styles.selectTooltipHolder}>
                                    <select
                                      onChange={e => {
                                        setCircle(e.target.value);
                                      }}
                                    >
                                      {mapMetrics[mapId]
                                        .filter(d => d.for.includes("circle"))
                                        .map(d => (
                                          <option
                                            key={d.id}
                                            value={d.id}
                                            selected={
                                              circle.toString() ===
                                              d.id.toString()
                                            }
                                          >
                                            {
                                              metricMeta[d.id]
                                                .metric_displayname
                                            }
                                          </option>
                                        ))}
                                    </select>
                                    <InfoTooltip
                                      text={
                                        metricMeta[circle].metric_definition
                                      }
                                      setInfoTooltipContent={
                                        props.setInfoTooltipContent
                                      }
                                      place={"left"}
                                    />
                                  </div>

                                  {
                                    // // lin or log scale toggle
                                    // // currently disabled
                                    // <select
                                    //   onChange={e => {
                                    //     setLinCircleScale(
                                    //       e.target.value === "linear"
                                    //         ? true
                                    //         : false
                                    //     );
                                    //   }}
                                    // >
                                    //   <option
                                    //     value="linear"
                                    //     selected={linCircleScale}
                                    //   >
                                    //     Linear scale
                                    //   </option>
                                    //   <option
                                    //     value="log"
                                    //     selected={!linCircleScale}
                                    //   >
                                    //     Log scale
                                    //   </option>
                                    // </select>
                                  }
                                </>
                              )}
                            </div>,
                          ].map(d => d)}
                        </>,
                      ],
                    }}
                  />
                }
                {
                  <DateSlider
                    {...{
                      label:
                        "View policies and cases over the course of the outbreak",
                      date,
                      setDate,
                      float: true,
                      // { minDate: YYYY-MM-DD, maxDate: YYYY-MM-DD }
                      ...defaults.minMaxDate,
                      key: "DateSlider",
                    }}
                  />
                }
              </>
            ),
            plugins: {
              fill,
              circle,
              places,
              policyResolution,
            },
          }}
        />
      )
    );
  }

  // EFFECT HOOKS // -------------------------------------------------------------//
  // init
  useEffect(function initializeOptionSets() {
    // set loading spinner to visible
    setLoading(true);

    // set current page
    setPage("policymaps");

    if (!initialized) getData();
  }, []);

  // when date is changed, update `dates_in_effect` filter
  useEffect(
    function updateFilters() {
      const newFilters = { ...filters };
      const dateStr = date.format("YYYY-MM-DD");
      newFilters.dates_in_effect = [dateStr, dateStr];
      setFilters(newFilters);
    },
    [date]
  );

  // when map style changes, update default metrics selected
  useEffect(
    function updateDefaultMetrics() {
      setCircle(defaults[mapId].circle);
      setFill(defaults[mapId].fill);
    },
    [mapId]
  );

  // when map data selection changes, update dynamic title
  useEffect(
    function updateDynamicMapTitle() {
      setMapTitle(getMapTitle({ fill, circle, mapId }));
    },
    [circle, fill, mapId]
  );

  // JSX // -----------------------------------------------------------------//
  if (!initialized) return <div />;
  else
    return (
      <div className={style}>
        {
          // Drawer: holds map options
        }
        {
          // display map component(s)
        }
        {maps}
      </div>
    );
};

export default Map;

/**
 * Radio buttons toggling the map ID displayed.
 * @param {*} props
 */
function MapIdToggle(props) {
  const noun = props.mapId === "us" ? "State" : "National";
  const showChildren = (mapId, fill, value) => {
    return mapId === value && fill === "policy_status_counts";
  };
  return (
    <RadioToggle
      {...{
        left: true,
        horizontal: false,
        setInfoTooltipContent: props.setInfoTooltipContent,
        tooltipPlace: "top",
        choices: Object.values(mapStyles).map(({ value, name, tooltip }) => {
          return {
            value,
            name,
            tooltip,
            // children: showChildren(props.mapId, props.fill, value) ? (
            //   <RadioToggle
            //     choices={[
            //       { value: "geo", label: `${noun}-level policies` },
            //       {
            //         value: "subgeo",
            //         label: `Sub-${noun.toLowerCase()}-level policies`,
            //       },
            //     ]}
            //     curVal={props.policyResolution}
            //     callback={props.setPolicyResolution}
            //   />
            // ) : (
            //   undefined
            // ),
          };
        }),
        curVal: props.mapId,
        callback: props.setMapId,
        label: "Geographic resolution",
      }}
    />
  );
}
