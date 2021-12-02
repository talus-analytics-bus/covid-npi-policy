/**
 * Container for a Mapbox map and related controls.
 *
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// 3rd party packages
import React, {
  useCallback,
  useEffect,
  useState,
  FC,
  ReactElement,
} from "react";
import { Moment } from "moment";
import { Helmet } from "react-helmet";

// custom hooks
import usePrevious from "components/common/hooks/usePrevious";
import useHistory from "components/common/hooks/useHistory";

// contexts
import { MapOptionProvider } from "./context/MapOptionContext";

// data queries
import { OptionSet, CountriesWithDistancingLevels, execute } from "api/Queries";
import PlaceQuery from "../../../api/PlaceQuery";

// assets and styles
import styles from "./map.module.scss";

// local components and helper functions
import { LoadingSpinner, MapboxMap } from "../../common";
import { AmpMapOptionsPanel } from "./content/AmpMapOptionsPanel/AmpMapOptionsPanel";
import { AmpMapLegendPanel } from "./content/AmpMapLegendPanel/AmpMapLegendPanel";
import { AmpMapDatePanel } from "./content/AmpMapDatePanel/AmpMapDatePanel";
import {
  FilterDefs,
  Filters,
  MapDataShapeId,
  MapId,
  MapProps,
  PolicyResolution,
} from "../../common/MapboxMap/plugins/mapTypes";
import { PanelSet } from "../../common/MapboxMap/content/MapPanel/PanelSet/PanelSet";
import { Option } from "components/common/OptionControls/types";
import MapDrape from "./content/MapDrape/MapDrape";

// helper functions and data
import { defaults } from "../../common/MapboxMap/plugins/data";
import {
  replaceMapIdState as replaceHistoryMapId,
  getParamsMapId,
  getMapTitle,
  ampMapFilterDefs,
  getCaseDataUpdateDate,
  getOverallUpdateDate,
  getInitFilters,
  removeViewState,
} from "./helpers";
import MapPlaceContext from "./context/MapPlaceContext";
import { OptionSetRecord } from "api/queryTypes";
import { url } from "inspector";
import moment from "moment";

// FUNCTION COMPONENT // ----------------------------------------------------//
const Map: FC<MapProps> = ({
  loading,
  setLoading,
  setPage,
  versions,
  setInfoTooltipContent,
  urlParams,
}) => {
  // STATE // ---------------------------------------------------------------//
  // has initial data been loaded?
  const [initialized, setInitialized] = useState(false);

  // is current map mode changing? e.g., from US states to world countries?
  const [mapIsChanging, setMapIsChanging] = useState(false);

  // map circle scale linear? otherwise log
  const linCircleScale: boolean = true;

  // is data being loaded?
  const [dataIsLoading, setDataIsLoading] = useState(false);

  // track map zoom level
  const [zoomLevel, setZoomLevel] = useState(0);

  // get unique ID of map to display, e.g., 'us', 'global'
  // if there is a map id in the URL search params, use it as the initial value
  // otherwise use the specified default map ID
  const defaultMapId: MapId = defaults.mapId;
  const paramsMapId: MapId | null = getParamsMapId(defaultMapId);
  const [mapId, _setMapId] = useState<MapId>(defaultMapId);
  const prevMapId: MapId | undefined = usePrevious(mapId);

  // get browser history object using custom hook
  const history: History = useHistory();

  /**
   * Always set map status to "changing" when map ID is changed
   */
  const setMapId = useCallback(
    v => {
      // mark map as in "changing" state (prevents API requests)
      setMapIsChanging(true);

      // update map ID
      _setMapId(v);

      // update URL search params
      replaceHistoryMapId(history, v);
    },
    [history]
  );

  // track whether to show policies at the selected geo or below it
  const [policyResolution, setPolicyResolution] = useState<PolicyResolution>(
    PolicyResolution.geo
  );

  // set default date of map based on most recent case data
  const casesUpdatedMoment: Moment = getCaseDataUpdateDate(versions, mapId);
  const [date, setDate] = useState<Moment>(moment());
  // const [date, setDate] = useState<Moment>(casesUpdatedMoment);
  const prevDate: Moment | undefined = usePrevious(date);

  // set default fill metric
  const [fill, setFill] = useState<MapDataShapeId>(defaults[mapId].fill);
  const prevFill: MapDataShapeId = usePrevious(fill);

  // set default circle metric
  const initialCircle: MapDataShapeId = defaults[mapId].showCircle
    ? defaults[mapId].circle
    : null;
  const [circle, setCircle] = useState<MapDataShapeId>(initialCircle);
  const prevCircle = usePrevious(circle);

  // track dynamic map title
  const [mapTitle, setMapTitle] = useState("");

  // list of ISO3 codes of countries for which distancing levels are available
  const [geoHaveData, setGeoHaveData] = useState(null);

  // definition data for filters to display in drawer content section
  const [filterDefs, setFilterDefs] = useState<FilterDefs[]>(ampMapFilterDefs);

  // currently selected filters
  const [filters, setFilters] = useState<Filters>(getInitFilters());
  const prevFilters = usePrevious(filters);

  // country data for tooltip names
  const [places, setPlaces] = useState(null);

  // county-level places for maps that show counties
  const [countyNamesByFips, setCountyNamesByFips] = useState([{}]);

  // define possible categories based on optionset API response
  const catOptions: Option[] = filterDefs[0].primary_ph_measure.items.map(i => {
    return { name: i.label !== undefined ? i.label : i.value, value: i.value };
  });

  // define possible subcategories based on optionset API response
  const subcatOptions: Option[] = filterDefs[0].ph_measure_details.items.map(
    i => {
      return {
        name: i.label !== undefined ? i.label : i.value,
        value: i.value,
        parent: i.group,
      };
    }
  );

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  /**
   * Get data for page
   */
  const getMapData = useCallback(async () => {
    const queries: Record<string, Promise<any>> = {};
    // get all country places for tooltip names, etc.
    queries.places = PlaceQuery({ place_type: ["country"] });
    queries.countyNamesByFips = PlaceQuery({ place_type: ["county"] });

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

    const queryResults = await execute({
      queries,
    });

    // if page is first initializing, also retrieve filter optionset values for
    // non-date filters
    const optionsets: { [k: string]: OptionSetRecord[] } =
      queryResults["optionsets"].data;

    // set options for filters
    const updatedFilterDefs: FilterDefs[] = [...filterDefs];
    updatedFilterDefs.forEach(filterDef => {
      for (const [fieldName] of Object.entries(filterDef)) {
        if (
          !fieldName.startsWith("date") &&
          filterDef[fieldName].items !== undefined &&
          filterDef[fieldName].items.length === 0
        )
          filterDef[fieldName].items = optionsets[fieldName];
      }
    });

    // update datasets needed for map
    setPlaces(queryResults.places);
    setCountyNamesByFips(queryResults.countyNamesByFips);
    setFilterDefs(updatedFilterDefs);
    setGeoHaveData(queryResults.countriesWithDistancingLevels);

    // set map as initialized so these datasets are not retrieved again
    setInitialized(true);

    // TODO fix dependencies -- adding `filterDefs` causes double call
    // eslint-disable-next-line
  }, []);

  // CONSTANTS // ---------------------------------------------------------- //
  // get overal last updated date of data, using most recent data
  // series version
  const overallUpdateDate: Moment = getOverallUpdateDate(versions, mapId);

  // EFFECT HOOKS // ------------------------------------------------------- //
  // initialize page data
  useEffect(
    function initializeOptionSets() {
      // set loading spinner to visible
      setLoading(true);

      // set current page
      setPage("policymaps");

      // get map data if not already initialized
      if (!initialized) {
        getMapData();
      }
    },
    [getMapData, initialized, setLoading, setPage]
  );

  // useEffect(() => {
  //   if (initialized) {
  //     setInitialized(false);
  //     if (new URLSearchParams(urlParams).get("view") === "omicron_travel") {
  //       setFilters({ subtarget: ["Omicron"] });
  //     }
  //   }
  // }, [urlParams, initialized]);

  // initialize URL parameter variable containing map ID
  useEffect(() => {
    replaceHistoryMapId(history, mapId);
    if (paramsMapId !== mapId) {
      setMapId(paramsMapId);
    }
  }, [paramsMapId, history, setMapId, mapId]);

  // When map ID is changed, update policy resolution to a supported one,
  // if needed -- for counties, only "geo" is supported
  useEffect(() => {
    if (mapId === "us-county" && policyResolution !== PolicyResolution.geo)
      setPolicyResolution(PolicyResolution.geo);
  }, [mapId, policyResolution, setPolicyResolution]);

  // when map style changes, update default metrics selected
  // TODO persist selection across map types if it makes sense
  useEffect(
    function updateDefaultMetrics() {
      // start loading spinner
      // setLoading(true);

      // if circles are shown in default map view, show the default circle,
      // otherwise, set to null (show no circle)
      if (defaults[mapId].showCircle !== false)
        setCircle(defaults[mapId].circle || null);
      else setCircle(null);

      // show default map fill
      setFill(defaults[mapId].fill);

      // if filters are in "none" state, reset them
      if (getIsNoneState(filters)) {
        setFilters({
          ...filters,
          primary_ph_measure: [],
          ph_measure_details: [],
        });
      }

      // set map as no longer changing if it was changing
      if (mapIsChanging) setMapIsChanging(false);
    },
    // TODO fix dependencies
    // eslint-disable-next-line
    [mapId, mapIsChanging, setLoading]
  );

  // when map circle/fill data selection changes, update dynamic title
  useEffect(
    function updateDynamicMapTitle() {
      setMapTitle(getMapTitle(fill, circle));
    },
    [circle, fill]
  );

  // page title and metadata
  const helmet: ReactElement = (
    <Helmet>
      <title>Policy maps</title>
      <meta name="Maps of policies in COVID AMP" />
    </Helmet>
  );

  // JSX // -----------------------------------------------------------------//
  if (!initialized)
    return (
      <div>
        <Helmet>
          <title>Policy maps</title>
          <meta name="Maps of policies in COVID AMP" />
        </Helmet>
      </div>
    );
  else
    return (
      <div className={styles.map}>
        {helmet}
        {/* Provide data for current and previous map options selections */}
        <MapPlaceContext.Provider value={countyNamesByFips}>
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
              catOptions,
              subcatOptions,
            }}
          >
            <LoadingSpinner
              text={"Loading data"}
              isReady={!dataIsLoading || loading}
              isFill={true}
              delay={500}
            />
            <MapboxMap
              key={mapId}
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
                        overallUpdateDate,
                        versions,
                        setInfoTooltipContent,
                      }}
                    />
                    <PanelSet
                      style={{
                        gridTemplateColumns: "auto auto auto",
                      }}
                    >
                      <AmpMapLegendPanel
                        {...{
                          zoomLevel,
                          linCircleScale,
                          policyResolution,
                        }}
                      />
                      <AmpMapDatePanel
                        {...{ date, setDate, ...defaults.minMaxDate }}
                      />
                      <AmpMapOptionsPanel
                        {...{
                          mapId,
                          setMapId,
                          catOptions,
                          subcatOptions,
                        }}
                      />
                    </PanelSet>
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
        </MapPlaceContext.Provider>
      </div>
    );
};

export default Map;
function getIsNoneState(filters: Filters) {
  return (
    filters.primary_ph_measure !== undefined &&
    filters.primary_ph_measure.length === 1 &&
    filters.primary_ph_measure[0] === "None"
  );
}
