/**
 * Page for a Mapbox map and related controls.
 *
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// 3rd party packages
import React, { useCallback, useEffect, useState } from "react";
import moment, { Moment } from "moment";

// custom hooks
import usePrevious from "components/common/hooks/usePrevious";
import useHistory from "components/common/hooks/useHistory";

// context
import { MapOptionProvider } from "./context/MapOptionContext";

// data queries
import {
  OptionSet,
  CountriesWithDistancingLevels,
  execute,
} from "../../misc/Queries";
import PlaceQuery from "../../misc/PlaceQuery";

// assets and styles
import styles from "./map.module.scss";

// local components and helper functions
import { LoadingSpinner, MapboxMap } from "../../common";
import { AmpMapOptionsPanel } from "./content/AmpMapOptionsPanel/AmpMapOptionsPanel";
import { AmpMapLegendPanel } from "./content/AmpMapLegendPanel/AmpMapLegendPanel";
import { AmpMapDatePanel } from "./content/AmpMapDatePanel/AmpMapDatePanel";
import { FC } from "react";
import {
  FilterDefs,
  MapDataShapeId,
  MapId,
  MapProps,
  PolicyResolution,
} from "../../common/MapboxMap/plugins/mapTypes";
import { PanelSet } from "../../common/MapboxMap/content/MapPanel/PanelSet/PanelSet";
import { VersionDataProps } from "components/misc/queryTypes";
import { Option } from "components/common/OptionControls/types";
import MapDrape from "./content/MapDrape/MapDrape";

// helper functions and data
import { defaults, metricMeta } from "../../common/MapboxMap/plugins/data";
import { mapStyles } from "../../common/MapboxMap/plugins/sources";
import { getInitLower } from "../../misc/Util";
import { replaceMapIdState, getParamsMapId } from "./helpers";

// FUNCTION COMPONENT // ----------------------------------------------------//
const Map: FC<MapProps> = ({
  loading,
  setLoading,
  setPage,
  versions,
  setInfoTooltipContent,
}) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // is current map mode changing? e.g., from US states to world countries?
  const [mapIsChanging, setMapIsChanging] = useState(false);

  // map circle scale linear? otherwise log
  const [linCircleScale] = useState(true);

  // is data being loaded?
  const [dataIsLoading, setDataIsLoading] = useState(false);

  // track map zoom level
  const [zoomLevel, setZoomLevel] = useState(0);

  // get unique ID of map to display, e.g., 'us', 'global'
  // if there is a map id in the URL search params, use it as the initial value
  // otherwise use the specified default map ID
  const defaultMapId: MapId = defaults.mapId;
  const paramsMapId: MapId | null = getParamsMapId();
  const [mapId, _setMapId] = useState<MapId>(defaultMapId);
  const prevMapId: MapId | undefined = usePrevious(mapId);

  // get browser history object using custom hook
  const history: History = useHistory();

  /**
   * Always set map status to "changing" when map ID is changed
   */
  const setMapId = useCallback(
    v => {
      setMapIsChanging(true);
      _setMapId(v);

      // update URL search params
      replaceMapIdState(history, v);
    },
    [history]
  );

  // track whether to show policies at the selected geo or below it
  const [policyResolution, setPolicyResolution] = useState<PolicyResolution>(
    PolicyResolution.geo
  );

  // default date of the map viewer -- `defaults.date` must be YYYY-MM-DD str
  const casesUpdatedDatum: VersionDataProps | undefined = versions.find(
    d => d.name.includes("COVID-19") && d.map_types.includes(mapId)
  );
  const casesUpdatedMoment: Moment = casesUpdatedDatum
    ? moment(casesUpdatedDatum.last_datum_date)
    : moment();
  defaults.minMaxDate.maxDate = casesUpdatedMoment.format("YYYY-MM-DD");
  const [date, setDate] = useState<Moment>(casesUpdatedMoment);
  const prevDate: Moment | undefined = usePrevious(date);

  // name of metric to use as fill by default
  const [fill, setFill] = useState<MapDataShapeId>(defaults[mapId].fill);
  const prevFill: MapDataShapeId = usePrevious(fill);

  const initialCircle: MapDataShapeId = defaults[mapId].showCircle
    ? defaults[mapId].circle || null
    : null;

  // name of metric to use as circle by default
  const [circle, setCircle] = useState<MapDataShapeId>(initialCircle);
  const prevCircle = usePrevious(circle);

  /**
   * Returns the appropriate dynamic title for the map based on the data
   * shapes currently displayed on it.
   *
   * @param fill The fill data shape ID
   * @param circle The circle data shape ID
   * @returns The appropriate dynamic title for the map
   */
  const getMapTitle: Function = (
    fill: MapDataShapeId,
    circle: MapDataShapeId
  ): string => {
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
      if (fill !== undefined && fill !== null) {
        title += metricMeta[fill].metric_displayname;
      }
      if (circle !== null && circle !== undefined) {
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
  const [filterDefs, setFilterDefs] = useState<FilterDefs[]>([
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

        // placeholder
        items: [],
      },

      // additional filters
      ph_measure_details: {
        field: "ph_measure_details",
        label: "Policy subcategory filter",
        radio: false,
        primary: "primary_ph_measure",
        entity_name: "Policy",
        items: [],
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
  const getData = useCallback(async () => {
    const queries: Record<string, Promise<any>> = {};
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
    const newFilterDefs: FilterDefs[] = [...filterDefs];
    newFilterDefs.forEach(d => {
      for (const [k] of Object.entries(d)) {
        if (!k.startsWith("date") && d[k].items.length === 0)
          d[k].items = optionsets[k];
      }
    });
    setPlaces(results.places);
    setFilterDefs(newFilterDefs);
    setGeoHaveData(results.countriesWithDistancingLevels);
    setInitialized(true);
  }, [filterDefs]);

  const applicableVersions: VersionDataProps[] = versions.filter(d => {
    return d.map_types.includes("all") || d.map_types.includes(mapId);
  });
  // CONSTANTS // -----------------------------------------------------------//
  // last updated date of overall data
  const lastUpdatedDateOverall = applicableVersions[0].date;

  // EFFECT HOOKS // -------------------------------------------------------------//
  // init
  useEffect(
    function initializeOptionSets() {
      // set loading spinner to visible
      setLoading(true);

      // set current page
      setPage("policymaps");

      if (!initialized) {
        getData();
      }
    },
    [getData, initialized, setLoading, setPage]
  );

  // initialize URL parameter for map ID
  useEffect(() => {
    if (paramsMapId === null) replaceMapIdState(history, mapId);
    else if (paramsMapId !== mapId) {
      setMapId(paramsMapId);
    }
  }, [paramsMapId, history, setMapId, mapId]);

  // When map ID is changed, update policy resolution to a supported one,
  // if needed
  useEffect(() => {
    if (mapId === "us-county" && policyResolution !== PolicyResolution.geo)
      setPolicyResolution(PolicyResolution.geo);
  }, [mapId, policyResolution, setPolicyResolution]);

  // when map style changes, update default metrics selected
  // TODO persist selection across map types if it makes sense
  useEffect(
    function updateDefaultMetrics() {
      // start loading spinner
      setLoading(true);

      // if circles are shown in default map view, show the default circle,
      // otherwise, set to null (show no circle)
      if (defaults[mapId].showCircle !== false)
        setCircle(defaults[mapId].circle || null);
      else setCircle(null);

      // show default map fill
      setFill(defaults[mapId].fill);

      // remove map changing flag
      if (mapIsChanging) setMapIsChanging(false);
    },
    [mapId, mapIsChanging, setLoading]
  );

  // when map circle/fill data selection changes, update dynamic title
  useEffect(
    function updateDynamicMapTitle() {
      setMapTitle(getMapTitle(fill, circle));
    },
    [circle, fill]
  );

  const categoryOptions: Option[] = filterDefs[0].primary_ph_measure.items.map(
    i => {
      return { name: i.label, value: i.value };
    }
  );
  const subcategoryOptions: Option[] = filterDefs[0].ph_measure_details.items.map(
    i => {
      return {
        name: i.label,
        value: i.value,
        parent: i.group,
      };
    }
  );
  // TODO implement history handling such that "forward" returns you to the
  // previously-selected map state
  // // handle history
  // useEffect(() => {
  //   const popstateListener = function(e) {
  //     console.log(e.state);
  //     updateUrlParams(history, mapId);
  //   };
  //   window.addEventListener("popstate", popstateListener);
  //   return () => {
  //     window.removeEventListener("popstate", popstateListener);
  //   };
  // }, []);

  // JSX // -----------------------------------------------------------------//
  if (!initialized) return <div />;
  else
    return (
      <div className={styles.map}>
        {/* Provide data for current and previous map options selections */}
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
            categoryOptions,
            subcategoryOptions,
          }}
        >
          <LoadingSpinner
            text={"Loading data"}
            ready={!dataIsLoading || loading}
            fill={true}
            delay={500}
          />
          <MapboxMap
            key={mapId}
            mapStyle={mapStyles[mapId]}
            setShowLoadingSpinner={setLoading}
            {...{
              setInfoTooltipContent,
              mapId,
              setMapId,
              linCircleScale,
              filters,
              geoHaveData,
              mapIsChanging,
              setDataIsLoading,
              setZoomLevel,
              overlays: (
                <>
                  <MapDrape
                    {...{
                      mapId,
                      mapTitle,
                      date,
                      lastUpdatedDateOverall,
                      versions,
                      setInfoTooltipContent,
                    }}
                  />
                  {
                    <PanelSet
                      style={{
                        gridTemplateColumns: "auto auto auto",
                      }}
                    >
                      <AmpMapLegendPanel
                        {...{ zoomLevel, linCircleScale, policyResolution }}
                      />
                      <AmpMapDatePanel
                        {...{ date, setDate, ...defaults.minMaxDate }}
                      />
                      <AmpMapOptionsPanel
                        {...{
                          mapId,
                          setMapId,
                          categoryOptions,
                          subcategoryOptions,
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
      </div>
    );
};

export default Map;
