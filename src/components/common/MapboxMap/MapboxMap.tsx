/**
 * Standard Mapbox map component for displaying metrics as fill and circle.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 * TODO add support for other types of map layers
 */

// standard packages
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";
import styles from "./mapboxmap.module.scss";
import classNames from "classnames";
import { defaults } from "./plugins/data";

// 3rd party packages
import ReactMapGL, {
  NavigationControl,
  AttributionControl,
  Popup,
  MapRef,
  MapEvent,
} from "react-map-gl";
import * as d3 from "d3";

// local modules
import { dataGetter } from "./plugins/dataGetter";
import { mapSources, mapStyles } from "./plugins/sources";
import { layerImages, layerStyles } from "./plugins/layers";
import { initMap, bindFeatureStates } from "./setup";
import { isEmpty } from "../../misc/UtilsTyped";
import { parseStringSafe } from "../../misc/UtilsTyped";
import ResetZoom from "./resetZoom/ResetZoom";

// context
import MapOptionContext from "../../views/map/context/MapOptionContext";
import AmpMapPopupDataProvider from "components/views/map/content/AmpMapPopupDataProvider/AmpMapPopupDataProvider";
import { elementIsMapCanvas } from "./plugins/helpers";
import useEventListener from "components/views/PolicyPage/hooks/useEventListener";
import Settings from "Settings";
import { FC } from "react";
import {
  FeatureLinkFields,
  FeatureLinkValues,
  Filters,
  MapData,
  MapFeature,
  MapId,
  MapMetric,
  MapSources,
  MapSourcesGeometry,
  MapStylesEntry,
  ViewportProps,
} from "./plugins/mapTypes";
import { MetricRecords, MetricRecord } from "api/queryTypes";
import { MutableRefObject } from "react";

// constants
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

/**
 * Properties passed to the `Mapbox` component.
 */
type MapboxMapProps = {
  /**
   * The unique ID of the type of map to be shown.
   */
  mapId: MapId;

  /**
   * The filters applied to the map data.
   */
  filters: Filters;

  /**
   * Overlays shown on top of the map, such as controls.
   */
  overlays: ReactNode[];

  /**
   * A list of ISO-3 codes of countries for which data are available.
   */
  geoHaveData: string[];

  /**
   * True if the scale used to set circle radii should be linear, false log.
   */
  linCircleScale: boolean;

  /**
   * True if the type of map is currently being changed, i.e., from global to
   * USA states, and false otherwise.
   *
   * This is used to block some re-renders while the map is changing.
   */
  mapIsChanging: boolean;

  /**
   * Sets whether the loading spinner is shown.
   */
  setShowLoadingSpinner: Dispatch<SetStateAction<boolean>>;

  /**
   * Sets whether data are being loaded (initialized, not updated).
   */
  setDataIsLoading: Dispatch<SetStateAction<boolean>>;

  /**
   * Set the current map zoom level for tracking purposes (does not affect map)
   */
  setZoomLevel: Dispatch<SetStateAction<number>>;

  /**
   * Additional parameters that are project-specific, such as parameters that
   * should be passed to API requests.
   */
  plugins: Record<string, any>;
};

// FUNCTION COMPONENT // ----------------------------------------------------//
/**
 * @method MapboxMap
 * @param {Object} props Destructured properties
 * @param {MapId} mapId The unique ID of the type of map to be shown.
 */
const MapboxMap: FC<MapboxMapProps> = ({
  mapId,
  filters,
  overlays,
  geoHaveData,
  plugins,
  linCircleScale,
  mapIsChanging,
  setShowLoadingSpinner,
  setDataIsLoading,
  setZoomLevel,
}) => {
  // STATE // ---------------------------------------------------------------//
  // store map reference which is frequently invoked to get the current
  // Mapbox map object in effect hooks
  let mapRef = useRef<MapRef | null>(null);

  // const [map, setMap] = useState(null);
  const curMapOptions = useContext(MapOptionContext);
  const { fill, circle, date } = curMapOptions;

  // is map initially loaded?
  const [loading, setLoading] = useState(true);

  // data to display in map -- reloaded whenever date or filter is changed
  const [data, setData] = useState<MapData>(null);

  // current viewport of map
  const [viewport, setViewport] = useState({
    ...defaults[mapId].initViewport,
  });
  const [defaultViewport, setDefaultViewport] = useState<ViewportProps>({
    latitude: 0,
    longitude: 0,
    zoom: 0,
  });

  // state management for tooltips
  const [cursorLngLat, setCursorLngLat] = useState([0, 0]);
  const [showTooltip, setShowMapPopup] = useState(false);
  const [mapPopup, setMapPopup] = useState<ReactNode | null>(null);

  // state management for selected/hovered status of geometries
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null
  );
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Whether the reset button is shown or not. True if viewport is other than
  // default, false otherwise
  const [showReset, setShowReset] = useState(false);

  // CONSTANTS // -----------------------------------------------------------//
  // get map style information
  const mapStyle: MapStylesEntry = mapStyles[mapId];

  // declare string versions of fill and circle IDs
  const circleIdStr = parseStringSafe(circle);
  const fillIdStr = parseStringSafe(fill);

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  const setLinLogCircleStyle = () => {
    // TODO check this use of "current"
    const map = mapRef.current !== null ? mapRef.current.getMap() : null;

    // does map have circle layers?
    const hasVisibleCircleLayers =
      circle !== null && mapSources[mapId].circle !== undefined;

    // if yes, update scale type of circle and its shadow
    // const circleLayers = mapSources[mapId].circle.circleLayers;
    const circleLayers = getSourceLayers(mapId, "circle", "circleLayers");
    if (hasVisibleCircleLayers) {
      circleLayers.forEach(layer => {
        const layerId = layer.id + "-" + getSourceKey(layer, "circle");

        const circleStyle: any = layerStyles.circle[
          layer.styleId.circle as string
        ](layer.id, linCircleScale);

        // circle
        map.setPaintProperty(
          layerId,
          "circle-radius",
          circleStyle.circleRadius
        );

        // its shadow
        map.setPaintProperty(
          layerId + "-shadow",
          "circle-radius",
          circleStyle.circleRadius
        );
      });
    }
  };

  /**
   * Initialize the vertical order of map shapes for certain metrics.
   */
  const updateFillOrder = (map: any) => {
    // TODO type of map
    const mapSourcesTyped = mapSources as MapSources;
    const fillLayers: any[] | undefined =
      mapSourcesTyped[mapId].fill.fillLayers;
    if (fillLayers !== undefined && fillLayers.length > 0) {
      // get data fields to bind data to geo feature
      const featureLinkField: FeatureLinkFields = fillLayers.find(
        d => d.id === fillIdStr
      ).featureLinkField;
      const promoteId = mapSourcesTyped[mapId].fill.def.promoteId;

      // get sort order of circles based on covid caseload metric
      const sortOrderMetricId = fillIdStr;
      if (sortOrderMetricId === undefined || sortOrderMetricId === null) return;
      else {
        const featureOrder: Record<string, number> = {};
        const dataToSort: MetricRecords | undefined =
          data !== null ? data[sortOrderMetricId] : undefined;
        if (dataToSort === undefined) return;
        dataToSort.forEach(d => {
          const hasBorder =
            d.value === "No restrictions" ||
            // d.value === null ||
            d.value === 0;
          const featureLinkVal: FeatureLinkValues = d[featureLinkField];
          if (featureLinkVal === undefined || featureLinkVal === null) return;
          else featureOrder[featureLinkVal] = hasBorder ? 2 : 1;
        });

        // for global maps only:
        if (mapId === "global")
          geoHaveData.forEach(d => {
            // set any geographies that have no data to 2
            if (featureOrder[d] === undefined) {
              featureOrder[d] = 2;
            }
          });

        // update circle ordering
        map.setLayoutProperty(
          sortOrderMetricId + "-fill-outline",
          "line-sort-key",
          [
            "case",
            [
              "!=",
              ["get", ["get", promoteId], ["literal", featureOrder]],
              null, // if the feature appears in the order list...
            ], // use its id to determine stack order
            ["get", ["get", promoteId], ["literal", featureOrder]],
            0, // otherwise put it on bottom
            // 3, // otherwise put it on top
          ]
        );
      }
    }

    // if circle layers are being used, then order circles smallest to
    // biggest for optimal click-ability
    const hasVisibleCircleLayers =
      mapSourcesTyped[mapId].circle !== undefined && circle !== null;
    if (hasVisibleCircleLayers) {
      const circleLayers = getSourceLayers(mapId, "circle", "circleLayers");
      // get data fields to bind data to geo feature
      const circLayers = circleLayers.filter(d => d.id === circleIdStr);
      if (circLayers === undefined) return; // TODO handle elegantly
      circLayers.forEach(circLayer => {
        const featureLinkField: FeatureLinkFields = circLayer.featureLinkField;
        const sortOrderSourceKey = getSourceKey(circLayer, "circle");
        if (sortOrderSourceKey !== undefined) {
          const promoteId: string =
            mapSourcesTyped[mapId][sortOrderSourceKey].def.promoteId;

          // get sort order of circles based on covid caseload metric
          const sortOrderMetricId = circleIdStr;
          if (
            sortOrderMetricId === undefined ||
            sortOrderMetricId === null ||
            data === null
          )
            return;
          else {
            const featureOrder: Record<string, number> = {};
            if (
              data[sortOrderMetricId] === undefined ||
              data[sortOrderMetricId] === null
            )
              return;
            data[sortOrderMetricId].forEach((d: MetricRecord) => {
              if (
                d[featureLinkField] === undefined ||
                d[featureLinkField] === null ||
                d.value === undefined ||
                d.value === null
              )
                return;
              else {
                const featureLinkVal: FeatureLinkValues = d[featureLinkField];
                if (featureLinkVal === undefined) return;
                featureOrder[featureLinkVal] = -d.value;
              }
            });

            // update circle ordering
            map.setLayoutProperty(
              sortOrderMetricId + "-" + sortOrderSourceKey,
              "circle-sort-key",
              ["get", ["get", promoteId], ["literal", featureOrder]]
            );
          }
        }
      });
    }
  };

  const updateFillStyles = (map: any) => {
    // if needed, update fill styles based on data
    const toCheck = ["policy_status_counts"];
    if (data === null) return;
    toCheck.forEach(key => {
      if (data[key] !== undefined) {
        const [minVal, maxVal] = getMinMaxVals(data, key);
        const fillStylesFunc = layerStyles.fill[key];
        const newFillColorStyle = fillStylesFunc(
          key,
          geoHaveData,
          maxVal,
          minVal
        );
        map.setPaintProperty(
          key + "-fill",
          "fill-color",
          newFillColorStyle["fill-color"]
        );
      }
    });
  };

  /**
   * Revert to default viewport
   * @method resetViewport
   * @return {[type]}       [description]
   */
  const resetViewport = () => {
    if (mapRef.current === null) return;
    const map = mapRef.current.getMap();

    // hide tooltip and reset button and fly to original position
    setShowMapPopup(false);
    flyToLongLat(
      // lnglat
      [defaultViewport.longitude, defaultViewport.latitude],

      // zoom
      defaultViewport.zoom,

      // map object
      map,

      // post-fly callback
      () => {
        setShowReset(false);
        setZoomLevel(defaultViewport.zoom);
      }
    );
  };

  /**
   * Fly user to specified longlat map location, and (if provided) to the
   * final zoom value -- otherwise the zoom value is 150% of the current
   * zoom value or 8, whichever is smaller.
   * @method flyToLongLat
   */
  const flyToLongLat: Function = (
    longlat: number[],
    finalZoom: number,
    map: any, // TODO define type
    callback: () => void = () => {}
  ) => {
    // Get current zoom level.
    const curZoom = viewport.zoom;

    // Set zoom level to fly to (0 to 24 inclusive). Either zoom in by 20% or
    // the minimum zoom level required to see facilities, whichever is
    // smaller. Use final zoom if it specified.
    const flyZoom = finalZoom !== null ? finalZoom : Math.min(4, curZoom * 1.5);

    // Start off flying
    let flying = true;

    /**
     * When flying stops, update the viewport position to match the place
     * that was flown to.
     * @method onFlyEnd
     */
    function onFlyEnd() {
      // Delete the event listener for the end of movement (we only want it to
      // be called when the current flight is over).
      map.off("moveend", onFlyEnd);

      // If flying,
      if (flying) {
        // Stop flying,
        flying = false;

        // Set viewport state to the flight destination and zoom level
        const newViewport = {
          width: "100%",
          height: "100%",
          longitude: longlat[0],
          latitude: longlat[1],
          zoom: flyZoom,
        };

        setViewport(newViewport);
        if (callback) callback();
      }
    }

    // Assign event listener so viewport is updated when flight is over.
    map.on("moveend", onFlyEnd);

    // Fly to the position occupied by the clicked cluster on the map.
    map.flyTo({
      center: longlat,
      zoom: flyZoom,
      bearing: 0,
      speed: 2,
      curve: 1,
      easing: function(t: any) {
        return t;
      },
    });

    // show reset (assuming viewport is not the default one)
    setShowReset(true);
  };

  // prep map data: when data arguments or the mapstyle change, reload data
  // map data updater function
  const getMapData = useCallback(
    async dataArgs => {
      setDataIsLoading(true);
      const newMapData = await dataGetter({
        data,
        ...dataArgs,
        ...curMapOptions,
      });
      setData(newMapData);
      setDataIsLoading(false);
    },
    [setDataIsLoading, data, curMapOptions]
  );

  /**
   * Update the current map tooltip
   * @method updateMapPopup
   */
  const updateMapPopup = async (map: any) => {
    if (selectedFeature !== null && date !== undefined) {
      setShowMapPopup(false);
      const newMapPopup: ReactNode = (
        <AmpMapPopupDataProvider
          onClose={(curPopupFeature: MapFeature) => {
            closePopup(
              mapRef,
              curPopupFeature,
              setShowMapPopup,
              setSelectedFeature
            );
          }}
          {...{
            key: selectedFeature !== null ? selectedFeature.id : undefined,
            mapId,
            feature: {
              ...selectedFeature,
              state: map.getFeatureState(selectedFeature),
            },
            dataDate: date,
            policyCategories: filters["primary_ph_measure"],
            policySubcategories: filters["ph_measure_details"],
            map,
            policyResolution: plugins.policyResolution,
            filters,
            circle,
          }}
        />
      );
      setShowMapPopup(true);
      setMapPopup(newMapPopup);
    }
  };

  // EFFECT HOOKS // --------------------------------------------------------//
  // get latest map data if date, filters, or map ID are updated
  useEffect(() => {
    if (!mapIsChanging)
      getMapData({
        date,
        filters,
        mapId,
        policyResolution: plugins.policyResolution,
      });
    // eslint-disable-next-line
  }, [filters, date, circle, fill, plugins.policyResolution, mapIsChanging]);

  // update map tooltip if the selected feature or metric are updated
  useEffect(() => {
    if (mapRef.current !== null)
      if (mapRef.current.getMap !== undefined) {
        const map = mapRef.current.getMap();
        updateMapPopup(map);
      }
    // eslint-disable-next-line
  }, [selectedFeature, circle, fill]);

  // update log/lin scale selection for circles
  useEffect(() => {
    if (mapRef.current !== null)
      if (mapRef.current.getMap !== undefined) {
        setLinLogCircleStyle();
      }
    // eslint-disable-next-line
  }, [linCircleScale]);

  // toggle visibility of map layers if selected metrics or map ID are updated
  useEffect(() => {
    // toggle visible layers based on selections
    if (mapRef.current !== null)
      if (mapRef.current.getMap !== undefined) {
        const map = mapRef.current.getMap();
        if (map.loaded()) {
          // define types of layers that should be checked
          const layerTypeInfo: {
            sourceTypeKey: "fill" | "circle";
            layerListKey: "fillLayers" | "circleLayers";
            curOption: string | null | undefined;
          }[] = [
            {
              sourceTypeKey: "circle",
              layerListKey: "circleLayers",
              curOption: parseStringSafe(circle),
            },
            {
              sourceTypeKey: "fill",
              layerListKey: "fillLayers",
              curOption: parseStringSafe(fill),
            },
          ];

          // for each type of layer to check, hide the layer and its auxiliary
          // layers if it's not the selected option for that layer type, or
          // show them otherwise
          layerTypeInfo.forEach(
            ({ sourceTypeKey, layerListKey, curOption }) => {
              // are there layers of this type defined in the map sources?
              const hasLayersOfType =
                (mapSources as MapSources)[mapId][sourceTypeKey] !== undefined;
              if (hasLayersOfType) {
                // get layers of this type (circle, fill, ...)
                let layersOfType = getSourceLayers(
                  mapId,
                  sourceTypeKey,
                  layerListKey
                );
                // const layersOfType = mapSources[mapId][sourceTypeKey][layerListKey];

                // for each layer determine whether it is visible
                layersOfType.forEach(layer => {
                  const sourceKey = getSourceKey(layer, sourceTypeKey);
                  // if layer is current option, it's visible
                  const visible = layer.id === curOption;
                  const visibility = visible ? "visible" : "none";
                  map.setLayoutProperty(
                    layer.id + "-" + sourceKey,
                    "visibility",
                    visibility
                  );

                  // same for any associated pattern layers this layer has
                  if (layer.styleOptions.pattern === true) {
                    map.setLayoutProperty(
                      layer.id + "-" + sourceKey + "-pattern",
                      "visibility",
                      visibility
                    );
                  }

                  // same for circle shadow layers
                  if (sourceTypeKey === "circle") {
                    map.setLayoutProperty(
                      layer.id + "-" + sourceKey + "-shadow",
                      "visibility",
                      visibility
                    );
                  }

                  // same for fill outline
                  if (sourceTypeKey === "fill") {
                    map.setLayoutProperty(
                      layer.id + "-" + sourceTypeKey + "-outline",
                      "visibility",
                      visibility
                    );
                  }
                });
              } else return;
            }
          );
        }
      }
  }, [circle, fill, mapId]);

  // initialize or update the map whenever the current map data changes
  useEffect(() => {
    // if no map data, do nothing
    if (data === null) return;
    else {
      // const map = mapRef.getMap();

      // if map has not yet loaded
      if (mapRef.current === null) return;
      const map = mapRef.current.getMap();
      if (loading) {
        // initialize the map
        // TODO define types
        initMap(
          map,
          mapId as any,
          geoHaveData,
          setShowLoadingSpinner,
          function afterMapLoaded() {
            // bind feature states to support data driven styling
            bindFeatureStates(
              map,
              mapId as any, // TODO typing
              data as any,
              plugins.circle,
              plugins.fill
            );

            // load layer images, if any, for pattern layers
            layerImages.forEach(({ asset, name }) => {
              map.loadImage(asset, (error: Error, image: string) => {
                if (error) throw error;
                map.addImage(name, image);
              });
            });

            // set loading flag to false (this block won't run again for
            // this map)
            setLoading(false);
          }
        );
      } else {
        // if map had already loaded, then just bind feature states using the
        // latest map data
        bindFeatureStates(
          map,
          mapId as any, // TODO define types
          data as any,
          plugins.circle,
          plugins.fill
        );
        updateFillOrder(map);
        updateFillStyles(map);
        updateMapPopup(map);
      }
    }
    // eslint-disable-next-line
  }, [data]);

  // MAP EVENT CALLBACKS // -------------------------------------------------//
  // TODO cleaner
  const sortByCircleValue = (
    a: { state: Record<string, any> },
    b: { state: Record<string, any> }
  ) => {
    const aVal: number =
      circle !== null && circle !== undefined ? a.state[circle] : 0;
    const bVal: number =
      circle !== null && circle !== undefined ? b.state[circle] : 0;
    return aVal - bVal;
  };
  /**
   * Handle map clicks: Select or deselect fill and show / hide tooltips
   * @method handleMapClick
   * @param  {[type]}    e [description]
   * @return {[type]}      [description]
   */
  const handleMapClick = (e: MapEvent) => {
    // allow no interaction until map exists
    if (mapRef.current === null) return;
    else if (e.target !== null) {
      // was the cursor moving on the map?
      const cursorOnMap = elementIsMapCanvas(e.target);
      if (!cursorOnMap) return;

      // Get map reference object and sources for map
      const map = mapRef.current.getMap();
      // allow no interaction until map loaded
      if (!map.loaded()) return;
      else {
        const sources = mapSources[mapId];

        // Get list of features under the mouse cursor.
        const features = map.queryRenderedFeatures(e.point);

        // Get fill and/or circle features that were under the cursor
        // TODO add other layer types as needed, currently only fill and circle
        // TODO typing
        const fillFeature = features.find((f: any) => {
          return (
            f["layer"]["source-layer"] === sources.fill.sourceLayer &&
            f.layer.type === "fill"
          );
        });

        if (circle !== null) features.sort(sortByCircleValue);
        // TODO typing
        const circleFeature = features.find((f: any) => {
          return (
            f["layer"]["source-layer"] === sources.circle.sourceLayer &&
            f.layer.type === "circle"
          );
        });

        // choose one feature from among the detected features to use as target.
        // circle takes precedence over fill feature since it is drawn on top
        const feature = circleFeature || fillFeature;
        // deselect the currently selected feature
        if (selectedFeature !== null) {
          map.setFeatureState(selectedFeature, { clicked: false });
        }

        // if a feature was discovered, mark is as selected and show the tooltip
        if (feature) {
          setCursorLngLat(e.lngLat);
          setSelectedFeature(feature);
          map.setFeatureState(feature, { clicked: true });

          // otherwise, mark no feature as selected and hide the tooltip
        } else {
          setShowMapPopup(false);
          setSelectedFeature(null);
        }
      }
    }
  };

  /**
   * Handle map mousemoves: highlight hovered fill
   * @method handleMapMouseMove
   * @param  {[type]}        e [description]
   * @return {[type]}          [description]
   */
  const handleMapMouseMove = (e: MapEvent) => {
    // allow no interaction until map exists
    if (mapRef.current === null) return;
    else {
      const map = mapRef.current.getMap();
      // allow no interaction until map loaded
      if (!map.loaded()) return;
      else {
        // if the cursor is not hovering on the map itself, unhover
        // all features
        const cursorOnMap = elementIsMapCanvas(e.target);

        if (!cursorOnMap) {
          if (hoveredFeature !== null) {
            map.setFeatureState(hoveredFeature, { hovered: false });
            setHoveredFeature(null);
          }
          // otherwise, highlight any hovered feature that is in the list of
          // permitted `layers`
        } else {
          // if there was a lnglat point returned to check, proceed
          if (e.point !== null) {
            // get all features in the list of layers to check
            const layers = [];
            if (circle) layers.push(circle + "-circle");
            if (fill) layers.push(fill + "-fill");
            const features = map.queryRenderedFeatures(e.point, {
              layers: layers,
            });
            if (circle !== null) features.sort(sortByCircleValue);

            // unhover the currently hovered feature if any
            if (hoveredFeature !== null) {
              map.setFeatureState(hoveredFeature, { hovered: false });
            }

            // if there is a feature hovered, get the first oen
            if (features.length > 0) {
              // set hovered feature to the new one
              const newHoveredFeature = features[0];
              setHoveredFeature(newHoveredFeature);
              map.setFeatureState(newHoveredFeature, { hovered: true });

              // use pointer cursor when hovering on feature
              map.getContainer().parentElement.parentElement.style.cursor =
                "pointer";

              // if no hovered feature, set it to null and use grab cursor
            } else {
              // use pointer when hovering on feature
              setHoveredFeature(null);
              map.getContainer().parentElement.parentElement.style.cursor =
                "grab";
            }
          }
        }
      }
    }
  };

  /**
   * When escape is pressed, close map popup and unselect feature.
   * @param {Event} e The key press event
   */
  const handleKeyPress = (e: KeyboardEvent) => {
    // TODO fix deprecation warning
    if (e.keyCode === 27) {
      // escape
      // deselect the currently selected feature
      if (selectedFeature !== null) {
        if (mapRef.current === null) return;
        const map = mapRef.current.getMap();
        map.setFeatureState(selectedFeature, {
          clicked: false,
        });
        setShowMapPopup(false);
        setSelectedFeature(null);
      } else if (showReset) {
        // reset zoom
        resetViewport();
      }
      setHoveredFeature(null);
    }
  };
  useEventListener("keydown", handleKeyPress, window);

  // JSX // -----------------------------------------------------------------//
  // render map only after data initially load
  if (data === null)
    return (
      <>
        {overlays}
        <div />
      </>
    );
  else
    return (
      <>
        {overlays}
        <ReactMapGL
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          ref={ref => {
            if (ref) mapRef = { current: ref };
          }}
          attributionControl={false}
          mapStyle={mapStyle.url}
          {...viewport}
          maxZoom={mapStyle.maxZoom}
          minZoom={mapStyle.minZoom}
          onViewportChange={(newViewport: ViewportProps) => {
            // set current viewport state variable to the new viewport
            setViewport(newViewport);
            setZoomLevel(newViewport.zoom);
            const lngLatNotDefault =
              newViewport.longitude !== defaultViewport.longitude ||
              newViewport.latitude !== defaultViewport.latitude;
            const zoomNotDefault = newViewport.zoom !== defaultViewport.zoom;

            // If viewport deviates from the default zoom or lnglat, show the
            // "Reset" button, otherwise, hide it
            if (
              (zoomNotDefault || lngLatNotDefault) &&
              !isEmpty(defaultViewport as any) // TODO typing
            )
              setShowReset(true);
            else setShowReset(false);
          }}
          onClick={handleMapClick}
          onMouseMove={handleMapMouseMove}
          onLoad={() => {
            // when map has loaded, add event listener to update the map data
            // whenever the map style, i.e., the type of map, is changed
            if (mapRef.current === null) return;
            const map = mapRef.current.getMap();

            updateFillOrder(map);
            updateFillStyles(map);
            setLinLogCircleStyle();

            // if default fit bounds are specified, center the viewport on them
            // (fly animation relative to default viewport)
            if (mapStyle.defaultFitBounds !== undefined) {
              const updateViewport = () => {
                const center = map.getCenter();
                setViewport({
                  ...viewport,
                  zoom: map.getZoom(),
                  longitude: center.lng,
                  latitude: center.lat,
                });
                setDefaultViewport({
                  ...viewport,
                  zoom: map.getZoom(),
                  longitude: center.lng,
                  latitude: center.lat,
                });
                setShowReset(false);
                map.off("moveend", updateViewport);
              };
              map.on("moveend", updateViewport);
              map.fitBounds(mapStyle.defaultFitBounds);
            }

            map.on("styledataloading", function() {
              getMapData({});
            });
          }}
          doubleClickZoom={false} //remove 300ms delay on clicking
        >
          {
            // map legend
          }
          {
            // map zoom plus and minus buttons
          }
          <div className={styles.navAndAttribControl}>
            <div
              className={classNames(styles.attributionControl, {
                [styles.empty]: mapStyle.attribution !== true,
              })}
            >
              <AttributionControl compact={false} />
            </div>
            <div className={styles.navigationControl}>
              <NavigationControl />
              {showReset && <ResetZoom handleClick={resetViewport} />}
            </div>
          </div>
          {// map tooltip component
          showTooltip && (
            <div className={styles.mapboxMap}>
              <Popup
                longitude={cursorLngLat[0]}
                latitude={cursorLngLat[1]}
                closeButton={false}
                closeOnClick={false}
                captureScroll={true}
              >
                {mapPopup}
              </Popup>
            </div>
          )}
        </ReactMapGL>
      </>
    );
};

export default MapboxMap;

function getSourceKey(layer: MapMetric, sourceTypeKey: string) {
  return layer.for.find((d: string) => d.startsWith(sourceTypeKey));
}

function getSourceLayers(
  mapId: MapId,
  sourceTypeKey: string,
  layerListKey: "fillLayers" | "circleLayers"
) {
  let layersOfType: MapMetric[] = [];
  const sourceKeys = Object.keys(mapSources[mapId]).filter(d =>
    d.startsWith(sourceTypeKey)
  );
  sourceKeys.forEach(sourceKey => {
    const curEntryOfType: MapSourcesGeometry = mapSources[mapId][sourceKey];
    if (curEntryOfType[layerListKey] !== undefined) {
      const curLayersOfType: any[] | undefined = curEntryOfType[layerListKey];
      if (curLayersOfType !== undefined)
        layersOfType = layersOfType.concat(curLayersOfType);
    }
  });
  return layersOfType;
}

/**
 * Given the master data object and the key to the data series of interest,
 * return the min and max observation vals. for that data series that should be
 * used for relative comparisons in the visualization.
 *
 * If min/max are not explicitly set but required to be, an error is thrown. If
 * they are not required to be explicitly set, the min/max are computed
 * directly from the data series.
 *
 * @param {Object} data The master data object containing all data series.
 * @param {string} key The key to the data series of interest.
 */
function getMinMaxVals(data: MapData, key: string): number[] {
  if (data === null) return [0, 0];
  const curSeries = data[key];
  if (
    curSeries.max_all_time !== undefined &&
    curSeries.min_all_time !== undefined
  ) {
    // return explicitly determined min/max values
    return [
      curSeries.min_all_time.value as number,
      curSeries.max_all_time.value as number,
    ];
  } else if (Settings.REQUIRE_EXPLICIT_MIN_MAX) {
    // throw error if explicit min/max required
    throw Error(
      "Min/Max observation data are missing from the data series for key = " +
        key +
        ". Please ensure the min/max is provided in the API response."
    );
  } else {
    const valsForMinMax: number[] = data[key].map((d: MetricRecord) => {
      if (typeof d.value === "number") return d.value;
      else return parseFloat(d.value || "");
    });
    // compute min/max from data series directly
    return [
      d3.min<number, number>(valsForMinMax, (d: number) => d) || 0,
      d3.max<number, number>(valsForMinMax, (d: number) => d) || 0,
    ];
  }
}

/**
 * Given the `mapId`, returns the appropriate set of nouns and the level with
 * which geographic features in the map should be referred to.
 */
export function getMapNouns(mapId: MapId) {
  switch (mapId) {
    case "us":
      return { plural: "States", singular: "State", level: "state" };
    case "us-county":
      return { plural: "Counties", singular: "County", level: "county" };
    case "us-county-plus-state":
      return {
        plural: "Counties",
        singular: "County",
        level: "state + county",
      };
    default:
      return {
        plural: "Countries",
        singular: "Country",
        level: "national",
      };
  }
}

const closePopup = (
  mapRef: MutableRefObject<MapRef | null>,
  selectedFeature: MapFeature | null,
  setShowMapPopup: Dispatch<SetStateAction<boolean>>,
  setSelectedFeature: Dispatch<SetStateAction<MapFeature | null>>
): void => {
  if (mapRef === null || mapRef.current === null || selectedFeature === null)
    return;
  else {
    const map = mapRef.current.getMap();
    map.setFeatureState(selectedFeature, {
      clicked: false,
    });
    setShowMapPopup(false);
    setSelectedFeature(null);
  }
};
