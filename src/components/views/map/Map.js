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

// assets and styles
import { style, drawer } from "./map.module.scss";

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
  // STATE // ---------------------------------------------------------------//
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
  const [filterDefs] = useState([
    {
      // name of filter (should match `field` below)
      place_name: {
        // data field
        field: "place_name",

        // display label
        label: "Place name",

        // true if radio button selection, false if dropdown
        // if radio is true, must also define defaultRadioValue
        radio: true,

        // default value of radio selections
        defaultRadioValue: "all",

        // if applicable: the primary filter on which this one depends; if
        // there is no value selected in the primary filter which is a group
        // for values in the secondary (dependent) filter, the latter will
        // show "no options" and not be usable

        // list of items for selection from filter
        items: [
          {
            // unique ID integer
            id: 0,

            // display value
            label: "All",

            // data value
            value: "all"
          },

          // additional items
          { id: 1, label: "Kentucky", value: "Kentucky" },
          { id: 2, label: "Texas", value: "Texas" }
        ]
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

  // setLoading(false);

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
  // when map style changes, update default metrics selected
  useEffect(
    function updateDefaultMetrics() {
      setCircle(defaults[mapId].circle);
      setFill(defaults[mapId].fill);
    },
    [mapId]
  );

  // JSX // -----------------------------------------------------------------//
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
