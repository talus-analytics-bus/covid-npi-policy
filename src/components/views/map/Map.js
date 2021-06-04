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

// custom hooks
import { usePrevious } from "../../misc/UtilsTyped";

// context
import { MapOptionProvider } from "./context/MapOptionContext";

// 3rd party packages
import moment from "moment";

// local packages
import { defaults, metricMeta } from "../../common/MapboxMap/plugins/data";
import { mapStyles } from "../../common/MapboxMap/plugins/sources";
import { getInitLower } from "../../misc/Util";
// queries
import {
  OptionSet,
  CountriesWithDistancingLevels,
  execute,
} from "../../misc/Queries";
import PlaceQuery from "../../misc/PlaceQuery";
import MapDrape from "./content/MapDrape/MapDrape";

// assets and styles
import { style, dark } from "./map.module.scss";

// common components
import { MapboxMap } from "../../common";
import { PanelSet } from "components/common/MapboxMap/content/MapPanel/PanelSet/PanelSet";
import { AmpMapOptionsPanel } from "./content/AmpMapOptionsPanel/AmpMapOptionsPanel";
import { AmpMapLegendPanel } from "./content/AmpMapLegendPanel/AmpMapLegendPanel";
import { AmpMapDatePanel } from "./content/AmpMapDatePanel/AmpMapDatePanel";

// FUNCTION COMPONENT // ----------------------------------------------------//

const Map = ({ setLoading, setPage, versions, ...props }) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // is current map mode changing? e.g., from US states to world countries?
  const [mapIsChanging, setMapIsChanging] = useState(false);

  // map circle scale linear? otherwise log
  const [linCircleScale] = useState(true);

  // unique ID of map to display, e.g., 'us', 'global'
  const [mapId, _setMapId] = useState(defaults.mapId);
  const prevMapId = usePrevious(mapId);

  /**
   * Always set map status to "changing" when map ID is changed
   */
  const setMapId = v => {
    setMapIsChanging(true);
    _setMapId(v);
  };

  // whether to show policies at the selected geo or below it
  const [policyResolution, setPolicyResolution] = useState("geo");

  // default date of the map viewer -- `defaults.date` must be YYYY-MM-DD str
  const casesLastUpdated =
    mapId === "us"
      ? versions.find(d => d.type === "COVID-19 case data")
      : versions.find(d => d.type === "COVID-19 case data (countries)");
  const casesLastUpdatedDate = casesLastUpdated
    ? moment(casesLastUpdated.last_datum_date)
    : moment();
  defaults.minMaxDate.maxDate = casesLastUpdatedDate;
  const [date, setDate] = useState(casesLastUpdatedDate);
  // const [date, setDate] = useState(new moment(defaults.date));
  const prevDate = usePrevious(date);

  // name of metric to use as fill by default
  const [fill, setFill] = useState(defaults[mapId].fill);
  const prevFill = usePrevious(fill);

  const initialCircle = defaults[mapId].showCircle
    ? defaults[mapId].circle
    : null;
  // name of metric to use as circle by default
  const [circle, setCircle] = useState(initialCircle);
  const prevCircle = usePrevious(circle);

  // dynamic map title
  const getMapTitle = ({ fill, circle }) => {
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
    // primary_ph_measure: ["Social distancing"],
  });
  const prevFilters = usePrevious(filters);

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
    console.log(newFilterDefs);
    setGeoHaveData(results.countriesWithDistancingLevels);
    setInitialized(true);
    setLoading(false);
  };

  // CONSTANTS // -----------------------------------------------------------//
  // last updated date of overall data
  const lastUpdatedDateOverall = versions.filter(d => {
    if (d.type === "COVID-19 case data (countries)" && mapId === "us") {
      return false;
    } else if (d.type === "COVID-19 case data" && mapId === "global") {
      return false;
    } else return true;
  })[0].date;

  // EFFECT HOOKS // -------------------------------------------------------------//
  // init
  useEffect(function initializeOptionSets() {
    // set loading spinner to visible
    setLoading(true);

    // set current page
    setPage("policymaps");

    if (!initialized) getData();
  }, []);

  // When map ID is changed, update policy resolution to a supported one,
  // if needed
  useEffect(() => {
    if (mapId === "us-county" && policyResolution !== "geo")
      setPolicyResolution("geo");
  }, [mapId, policyResolution, setPolicyResolution]);

  // when map style changes, update default metrics selected
  // TODO persist selection across map types if it makes sense
  useEffect(
    function updateDefaultMetrics() {
      if (defaults[mapId].showCircle !== false)
        setCircle(defaults[mapId].circle);
      else setCircle(null);
      setFill(defaults[mapId].fill);

      if (mapIsChanging) setMapIsChanging(false);
    },
    [mapId]
  );

  // when map data selection changes, update dynamic title
  useEffect(
    function updateDynamicMapTitle() {
      setMapTitle(getMapTitle({ fill, circle }));
    },
    [circle, fill]
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
        {
          <MapOptionProvider
            value={{
              fill,
              circle,
              date,
              filters,
              mapId,
              prevFill,
              prevCircle,
              prevDate,
              prevFilters,
              prevMapId,
              setCircle,
              setFill,
              setFilters,
            }}
          >
            <MapboxMap
              {...{
                setInfoTooltipContent: props.setInfoTooltipContent,
                mapId,
                setMapId,
                linCircleScale,
                key: mapId,
                mapStyle: mapStyles[mapId],
                filters,
                geoHaveData,
                mapIsChanging,
                overlays: (
                  <>
                    <MapDrape
                      setInfoTooltipContent={props.setInfoTooltipContent}
                      {...{
                        mapId,
                        mapTitle,
                        date,
                        lastUpdatedDateOverall,
                        versions,
                      }}
                    />
                    {
                      <PanelSet
                        style={{
                          gridTemplateColumns: "auto auto 20em",
                        }}
                      >
                        <AmpMapLegendPanel />
                        <AmpMapDatePanel
                          {...{ date, setDate, ...defaults.minMaxDate }}
                        />
                        <AmpMapOptionsPanel
                          {...{
                            key: "mapOptions",
                            mapId,
                            setMapId,
                            categoryOptions: filterDefs[0].primary_ph_measure.items.map(
                              i => {
                                return { name: i.label, value: i.value };
                              }
                            ),
                            subcategoryOptions: filterDefs[0].ph_measure_details.items.map(
                              i => {
                                return {
                                  name: i.label,
                                  value: i.value,
                                  parent: i.group,
                                };
                              }
                            ),
                          }}
                        />
                      </PanelSet>
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
          </MapOptionProvider>
        }
      </div>
    );
};

export default Map;
