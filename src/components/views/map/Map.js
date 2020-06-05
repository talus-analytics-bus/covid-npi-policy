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
import { style, drawer, wide } from "./map.module.scss";

// common components
import {
  MapboxMap,
  RadioToggle,
  Drawer,
  DateSlider,
  FilterSet
} from "../../common";

// FUNCTION COMPONENT // ----------------------------------------------------//
const Map = ({ setLoading, ...props }) => {
  console.log("wide");
  console.log(wide);
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

  // currently selected filters
  const [filters, setFilters] = useState({});

  // definition data for filters to display in drawer content section
  const [filterDefs, setFilterDefs] = useState([
    {
      // name of filter (should match `field` below)
      primary_ph_measure: {
        // data field
        field: "primary_ph_measure",

        // display label
        label: "Policy category",

        // true if radio button selection, false if dropdown
        // if radio is true, must also define defaultRadioValue
        radio: true,

        // default value of radio selections
        defaultRadioValue: "Social distancing",

        // classname to apply to filter
        className: wide

        // if applicable: the primary filter on which this one depends; if
        // there is no value selected in the primary filter which is a group
        // for values in the secondary (dependent) filter, the latter will
        // show "no options" and not be usable

        // // list of items for selection from filter
        // items: [
        //   {
        //     // unique ID integer
        //     id: 0,
        //
        //     // display value
        //     label: "All",
        //
        //     // data value
        //     value: "all"
        //   },
        //
        //   // additional items
        //   { id: 1, label: "Kentucky", value: "Kentucky" },
        //   { id: 2, label: "Texas", value: "Texas" }
        // ]
      },

      // additional filters
      place_iso: {
        field: "place_iso",
        label: "Sub-place name (test)",
        radio: false,
        primary: "place_name",
        items: [
          {
            id: 0,
            label: "Kentucky sub-place 1",
            value: "sp1",
            group: "Kentucky"
          },
          {
            id: 1,
            label: "Kentucky sub-place 2",
            value: "sp2",
            group: "Kentucky"
          },
          {
            id: 2,
            label: "Kentucky sub-place 3",
            value: "sp3",
            group: "Kentucky"
          }
        ]
      }
    }
  ]);

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  /**
   * Get data for page
   * @method getData
   * @param  {Object}  [filters={}] [description]
   * @return {Promise}              [description]
   */
  const getData = async (filters = {}) => {
    const method = Object.keys(filters).length === 0 ? "get" : "post";
    const queries = {
      // policies: Policy({
      //   method,
      //   filters,
      //   fields: [
      //     "id",
      //     "place",
      //     "primary_ph_measure",
      //     // "ph_measure_details",
      //     "desc",
      //     "date_start_effective",
      //     // "date_end_actual",
      //     // "date_end_anticipated",
      //     "file"
      //   ]
      // }),
      // metadata: Metadata({
      //   method: "get",
      //   fields: columns.map(d => {
      //     if (!d.dataField.includes(".")) return "policy." + d.dataField;
      //     else return d.dataField;
      //   })
      // })
    };
    if (true) {
      queries.optionsets = OptionSet({
        method: "get",
        fields: filterDefs
          .map(d => Object.values(d).map(dd => dd))
          .flat()
          .filter(d => !d.field.startsWith("date"))
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
        if (!k.startsWith("date")) d[k].items = optionsets[k];
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
            filters
          }}
        />
      )
    );
  }

  // EFFECTS // -------------------------------------------------------------//
  // init
  useEffect(function initializeOptionSets() {
    if (!initialized) getData();
  }, []);

  // when map style changes, update default metrics selected
  useEffect(
    function updateDefaultMetrics() {
      setCircle(defaults[mapId].circle);
      setFill(defaults[mapId].fill);
    },
    [mapId]
  );

  // JSX // -----------------------------------------------------------------//
  if (!initialized) return <div>Loading</div>;
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
                      label: "Circle metric",
                      key: "RadioToggle1"
                    }}
                  />,

                  // fill metric radio toggle
                  <RadioToggle
                    {...{
                      setInfoTooltipContent: props.setInfoTooltipContent,
                      choices: mapMetrics[mapId]
                        .filter(d => d.for.includes("fill"))
                        .map(d => {
                          return {
                            value: d.id,
                            name: metricMeta[d.id].metric_displayname,
                            tooltip: metricMeta[d.id].metric_definition
                          };
                        }),
                      curVal: fill,
                      callback: setFill,
                      label: "Fill metric",
                      key: "RadioToggle2"
                    }}
                  />
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
