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
  metricMeta
} from "../../common/MapboxMap/plugins/data";
import { mapStyles } from "../../common/MapboxMap/plugins/sources";

// queries
import { OptionSet, execute } from "../../misc/Queries";

// assets and styles
import { style, drawer, dark } from "./map.module.scss";

// common components
import {
  MapboxMap,
  RadioToggle,
  Drawer,
  DateSlider,
  FilterSet
} from "../../common";

// FUNCTION COMPONENT // ----------------------------------------------------//
const Map = ({ setLoading, setPage, setInitDataFilters, ...props }) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // unique ID of map to display, e.g., 'us', 'global'
  const [mapId, setMapId] = useState(defaults.mapId);

  // default date of the map viewer -- `defaults.date` must be YYYY-MM-DD str
  const [date, setDate] = useState(new moment(defaults.date));

  // name of metric to use as fill by default
  const [fill, setFill] = useState(defaults[mapId].fill);

  // name of metric to use as circle by default
  const [circle, setCircle] = useState(defaults[mapId].circle);

  // definition data for filters to display in drawer content section
  const [filterDefs, setFilterDefs] = useState([
    {
      lockdown_level: {
        field: "lockdown_level",
        label: "Data type",
        radio: true,
        defaultRadioValue: "primary_ph_measure",
        entity_name: "Policy",
        className: dark,
        items: [
          { id: 0, value: "primary_ph_measure", label: "Policy category" },
          { id: 1, value: "lockdown_level", label: "Lockdown level" }
        ]
      },
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
        defaultRadioValue: "Social distancing"
      },

      // additional filters
      ph_measure_details: {
        field: "ph_measure_details",
        label: "Policy subcategory",
        radio: false,
        primary: "primary_ph_measure",
        entity_name: "Policy",
        className: dark
      }
    }
  ]);

  // currently selected filters
  const [filters, setFilters] = useState({
    primary_ph_measure: ["Social distancing"]
  });

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
    if (true) {
      queries.optionsets = OptionSet({
        method: "get",
        fields: filterDefs
          .map(d => Object.values(d).map(dd => dd))
          .flat()
          .filter(d => !d.field.startsWith("date") && d.items === undefined)
          .map(d => {
            return d.entity_name + "." + d.field;
          }),
        entity_name: "Policy"
      });
    }

    const results = await execute({
      queries
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
        // if (k === "dates_in_effect") {
        //   // set min/max date range for daterange filters
        //   d[k].minMaxDate = {
        //     min: newMinMaxStartDate.min,
        //     max: undefined
        //   };
        // }
      }
    });
    setFilterDefs(newFilterDefs);
    setInitialized(true);
    setLoading(false);
  };

  // CONSTANTS // -----------------------------------------------------------//
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
            key: k,
            mapStyle: mapStyles[k],
            date,
            circle,
            fill,
            filters,
            plugins: {
              setInitDataFilters
            }
          }}
        />
      )
    );
  }

  // EFFECT HOOKS // -------------------------------------------------------------//
  // init
  useEffect(function initializeOptionSets() {
    // set current page
    setPage("map");

    if (!initialized) getData();

    // unset initial filters on page unmount
    return function unsetInitDataFilters() {
      setInitDataFilters(null);
    };
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

  // JSX // -----------------------------------------------------------------//
  if (!initialized) return <div />;
  else
    return (
      <div className={style}>
        {
          // Drawer: holds map options
        }
        <Drawer
          {...{
            className: drawer,
            // if true, drawer floats at top of parent container and
            // content has translucent background
            float: true,

            // closed by default
            defaultClosed: true,

            // header of drawer (JSX)
            label: (
              <React.Fragment>
                {
                  // Header
                }
                <h1>Map options</h1>

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
                        return { value, name, tooltip };
                      }
                    ),
                    curVal: mapId,
                    callback: setMapId,
                    label: "Geographic resolution"
                  }}
                />
                {
                  // Display active date
                }
                <div>{date.format("MMM D, YYYY").toUpperCase()}</div>
              </React.Fragment>
            ),
            content: (
              <div>
                {[
                  // Filter set containing the filters specified in `filterDefs`
                  <FilterSet
                    {...{
                      filterDefs,
                      filters,
                      setFilters,
                      // if true, the selected filters bay will show
                      // TODO style selected filters bay
                      showSelectedFilters: false,
                      key: "FilterSet"
                    }}
                  />,

                  // slider to modify the current date, including a calendar picker
                  <DateSlider
                    {...{
                      label: "Date",
                      date,
                      setDate,
                      // { minDate: YYYY-MM-DD, maxDate: YYYY-MM-DD }
                      ...defaults.minMaxDate,
                      key: "DateSlider"
                    }}
                  />,

                  // circle metric radio toggle
                  circle !== null && (
                    <RadioToggle
                      {...{
                        // TODO define choices based on current mapType
                        setInfoTooltipContent: props.setInfoTooltipContent,
                        choices: mapMetrics[mapId]
                          .filter(d => d.for.includes("circle"))
                          .map(d => {
                            return {
                              value: d.id,
                              name: metricMeta[d.id].metric_displayname,
                              tooltip: metricMeta[d.id].metric_definition
                            };
                          }),
                        curVal: circle,
                        callback: setCircle,
                        label: "View COVID count by",
                        key: "RadioToggle1"
                      }}
                    />
                  )
                ].map(d => d)}
              </div>
            )
          }}
        />
        {
          // display map component(s)
        }
        {maps}
      </div>
    );
};

export default Map;
