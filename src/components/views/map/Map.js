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
import * as d3 from "d3/dist/d3.min";
import moment from "moment";

// local packages
import {
  defaults,
  mapMetrics,
  metricMeta,
} from "../../common/MapboxMap/plugins/data";
import { mapStyles } from "../../common/MapboxMap/plugins/sources";

// queries
import {
  OptionSet,
  CountriesWithDistancingLevels,
  execute,
} from "../../misc/Queries";
import PlaceQuery from "../../misc/PlaceQuery";

// assets and styles
import styles, { style, drawer, dark } from "./map.module.scss";

// common components
import {
  MapboxMap,
  RadioToggle,
  Drawer,
  DateSlider,
  FilterSet,
  InfoTooltip,
} from "../../common";

// FUNCTION COMPONENT // ----------------------------------------------------//
const Map = ({ setLoading, setPage, versions, ...props }) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // is date slider playing?
  const [playing, setPlaying] = useState(false);

  // dragging the slider?
  const [nowDragging, setNowDragging] = useState(false);

  // map circle scale linear? otherwise log
  const [linCircleScale, setLinCircleScale] = useState(true);

  // unique ID of map to display, e.g., 'us', 'global'
  const [mapId, setMapId] = useState(defaults.mapId);

  // default date of the map viewer -- `defaults.date` must be YYYY-MM-DD str
  const caseloadLastUpdated =
    mapId === "us"
      ? versions.find(d => d.type === "COVID-19 caseload data")
      : versions.find(d => d.type === "COVID-19 caseload data (countries)");
  const caseloadLastUpdatedDate = caseloadLastUpdated
    ? moment(caseloadLastUpdated.last_datum_date)
    : moment();
  defaults.minMaxDate.maxDate = caseloadLastUpdatedDate;
  const [date, setDate] = useState(caseloadLastUpdatedDate);
  // const [date, setDate] = useState(new moment(defaults.date));

  // name of metric to use as fill by default
  const [fill, setFill] = useState(defaults[mapId].fill);

  // name of metric to use as circle by default
  const [circle, setCircle] = useState(defaults[mapId].circle);

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
    const method = Object.keys(filters).length === 0 ? "get" : "post";
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
      entity_name: "Policy",
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
      for (const [k, v] of Object.entries(d)) {
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
    if (d.type === "COVID-19 caseload data (countries)" && mapId === "us") {
      return false;
    } else if (d.type === "COVID-19 caseload data" && mapId === "global") {
      return false;
    } else return true;
  })[0].date;

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
            linCircleScale,
            key: k,
            mapStyle: mapStyles[k],
            date,
            initDate: caseloadLastUpdatedDate,
            circle,
            fill,
            filters,
            dateSliderMoving: playing || nowDragging, // whether date slider is currently playing
            geoHaveData,
            setAppLoading: setLoading,
            overlays: (
              <>
                <Drawer
                  {...{
                    className: drawer,
                    // if true, drawer floats at top of parent container and
                    // content has translucent background
                    float: true,

                    // closed by default
                    defaultClosed: true,

                    // if true, hides default toggle button
                    customToggle: true,

                    // header of drawer (JSX)
                    label: (
                      <React.Fragment>
                        {
                          // Header
                        }
                        <div className={styles.labelContainer}>
                          <h1>Map options</h1>
                          <button className={styles.toggle}>
                            <i className={"material-icons"}>expand_less</i>
                          </button>
                        </div>

                        {
                          // Toggle between the possible maps
                        }
                        <RadioToggle
                          {...{
                            left: true,
                            horizontal: true,
                            setInfoTooltipContent: props.setInfoTooltipContent,
                            choices: Object.values(mapStyles).map(
                              ({ value, name, tooltip }) => {
                                return {
                                  value,
                                  name,
                                  tooltip,
                                  // disabled: value === "global"
                                };
                              }
                            ),
                            curVal: mapId,
                            callback: setMapId,
                            label: "Geographic resolution",
                          }}
                        />
                        {
                          // Display active date
                        }
                        <div className={styles.dates}>
                          <div className={styles.primary}>
                            Data for {date.format("MMM D, YYYY")}
                          </div>
                          <div className={styles.secondary}>
                            Data last updated on{" "}
                            {moment(lastUpdatedDateOverall).format(
                              "MMM D, YYYY"
                            )}
                            <InfoTooltip
                              place={"left"}
                              text={
                                <div>
                                  {versions
                                    .filter(d => {
                                      if (
                                        d.type ===
                                          "COVID-19 caseload data (countries)" &&
                                        mapId === "us"
                                      ) {
                                        return false;
                                      } else if (
                                        d.type === "COVID-19 caseload data" &&
                                        mapId === "global"
                                      ) {
                                        return false;
                                      } else return true;
                                    })
                                    .map(d => (
                                      <p key={d.type}>
                                        <b>{d.type}</b> last updated on{" "}
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
                              setInfoTooltipContent={
                                props.setInfoTooltipContent
                              }
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    ),
                    content: (
                      <div>
                        {[
                          // fill metric radio toggle
                          fill !== null && (
                            <RadioToggle
                              {...{
                                // TODO define choices based on current mapType
                                setInfoTooltipContent:
                                  props.setInfoTooltipContent,
                                choices: mapMetrics[mapId]
                                  .filter(d => d.for.includes("fill"))
                                  .map(d => {
                                    return {
                                      value: d.id,
                                      name: metricMeta[d.id].metric_displayname,
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
                          <FilterSet
                            {...{
                              disabled: fill !== "policy_status",
                              filterDefs,
                              filters,
                              setFilters,
                              // if true, the selected filters bay will show
                              // TODO style selected filters bay
                              showSelectedFilters: false,
                              key: "FilterSet",
                            }}
                          />,
                          <div key={"divider"} className={styles.divider} />,

                          // circle metric radio toggle
                          <div className={styles.rightControls}>
                            <label>COVID caseload</label>
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
                                Show
                              </label>
                              <br />
                              <label>
                                <input
                                  type="radio"
                                  value="hide"
                                  name="casecount"
                                />{" "}
                                Hide
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
                                          {metricMeta[d.id].metric_displayname}
                                        </option>
                                      ))}
                                  </select>
                                  <InfoTooltip
                                    text={metricMeta[circle].metric_definition}
                                    setInfoTooltipContent={
                                      props.setInfoTooltipContent
                                    }
                                    place={"left"}
                                  />
                                </div>

                                <select
                                  onChange={e => {
                                    setLinCircleScale(
                                      e.target.value === "linear" ? true : false
                                    );
                                  }}
                                >
                                  <option
                                    value="linear"
                                    selected={linCircleScale}
                                  >
                                    Linear scale
                                  </option>
                                  <option
                                    value="log"
                                    selected={!linCircleScale}
                                  >
                                    Log scale
                                  </option>
                                </select>
                              </>
                            )}

                            {/* {circle !== null && ( */}
                            {/*   <RadioToggle */}
                            {/*     {...{ */}
                            {/*       // TODO define choices based on current mapType */}
                            {/*       setInfoTooltipContent: */}
                            {/*         props.setInfoTooltipContent, */}
                            {/*       choices: mapMetrics[mapId] */}
                            {/*         .filter(d => d.for.includes("circle")) */}
                            {/*         .map(d => { */}
                            {/*           return { */}
                            {/*             value: d.id, */}
                            {/*             name: */}
                            {/*               metricMeta[d.id].metric_displayname, */}
                            {/*             tooltip: */}
                            {/*               metricMeta[d.id].metric_definition, */}
                            {/*           }; */}
                            {/*         }), */}
                            {/*       curVal: circle, */}
                            {/*       callback: setCircle, */}
                            {/*       label: "", */}
                            {/*       key: "RadioToggle1", */}
                            {/*     }} */}
                            {/*   /> */}
                            {/* )} */}
                          </div>,
                        ].map(d => d)}
                      </div>
                    ),
                  }}
                />
                {
                  <DateSlider
                    {...{
                      label:
                        "View policies and cases over the course of the outbreak",
                      date,
                      setDate,
                      playing,
                      setPlaying,
                      nowDragging,
                      setNowDragging,
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
              places,
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

  // // when date is changed, update `dates_in_effect` filter
  // useEffect(
  //   function updateFilters() {
  //     const newFilters = { ...filters };
  //     const dateStr = date.format("YYYY-MM-DD");
  //     newFilters.dates_in_effect = [dateStr, dateStr];
  //     setFilters(newFilters);
  //   },
  //   [date]
  // );

  // when map style changes, update default metrics selected
  useEffect(
    function updateDefaultMetrics() {
      setCircle(defaults[mapId].circle);
      setFill(defaults[mapId].fill);
    },
    [mapId]
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
