/**
 * Standard Mapbox map component for display metrics as fill and circle.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 * TODO add support for other types of map layers
 */

// standard packages
import React, { useEffect, useState, useRef } from "react";
import styles from "./mapboxmap.module.scss";

// 3rd party packages
import ReactMapGL, { NavigationControl, Popup } from "react-map-gl";
import classNames from "classnames";
import * as d3 from "d3/dist/d3.min";

// local modules
import { metricMeta, dataGetter, tooltipGetter } from "./plugins/data";
import { mapSources } from "./plugins/sources";
import { layerImages, layerStyles } from "./plugins/layers";
import { initMap, bindFeatureStates } from "./setup";
import { isEmpty, getAndListString } from "../../misc/Util";
import ResetZoom from "./resetZoom/ResetZoom";
import MapTooltip from "./mapTooltip/MapTooltip";

// common components
import { Legend, ShowMore } from "..";

// constants
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// FUNCTION COMPONENT // ----------------------------------------------------//
/**
 * @method MapboxMap
 * @param  {[str]}  mapId        ID of map to show, e.g., 'us', 'global'
 * @param  {[type]}  mapStyle
 * @param  {[type]}  date         [description]
 * @param  {[type]}  circle       [description]
 * @param  {[type]}  fill         [description]
 * @param  {[type]}  filters      [description]
 * @param  {[type]}  props        [description]
 */
const MapboxMap = ({
  setMapId,
  mapId,
  mapStyle,
  date,
  circle,
  fill,
  filters,
  // array of JSX components that should go on top of the map field, e.g.,
  // map options and legend components
  overlays,
  geoHaveData,
  plugins,
  linCircleScale, // `log` or `lin`
  ...props
}) => {
  // STATE // ---------------------------------------------------------------//
  // store map reference which is frequently invoked to get the current
  // Mapbox map object in effect hooks
  let mapRef = useRef(null);

  // is map initially loaded?
  const [loading, setLoading] = useState(true);

  // data to display in map -- reloaded whenever date or filter is changed
  const [data, setData] = useState(null);

  // current viewport of map
  const [viewport, setViewport] = useState({});
  const [defaultViewport, setDefaultViewport] = useState({});

  // show or hide the legend
  const [showLegend, setShowLegend] = useState(true);

  // state management for tooltips
  const [cursorLngLat, setCursorLngLat] = useState([0, 0]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mapTooltip, setMapTooltip] = useState(null);

  // state management for selected/hovered status of geometries
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Whether the reset button is shown or not. True if viewport is other than
  // default, false otherwise
  const [showReset, setShowReset] = useState(false);

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  const setLinLogCircleStyle = () => {
    const map = mapRef.getMap();

    // does map have circle layers?
    const hasCircleLayers = mapSources[mapId].circle !== undefined;

    // if yes, update scale type of circle and its shadow
    const circleLayers = mapSources[mapId].circle.circleLayers;
    if (hasCircleLayers) {
      circleLayers.forEach(layer => {
        const layerId = layer.id + "-circle";

        const circleStyle = layerStyles.circle[layer.styleId.circle](
          layer.id,
          linCircleScale
        );

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

  const updateFillOrder = ({ map, f = null }) => {
    // initialize the vertical order of shapes for certain metrics
    if (mapId === "global") {
      const hasFillLayers = mapSources[mapId].fill !== undefined;
      if (hasFillLayers) {
        // get data fields to bind data to geo feature
        const featureLinkField = mapSources[mapId].fill.fillLayers.find(
          d => d.id === fill
        ).featureLinkField;
        const promoteId = mapSources[mapId].fill.def.promoteId;

        // get sort order of circles based on covid caseload metric
        const sortOrderMetricId = fill;
        if (sortOrderMetricId === undefined) return;
        else {
          const featureOrder = {};
          data[sortOrderMetricId].forEach(d => {
            const hasBorder = d.value === "No restrictions" || d.value === null;
            featureOrder[d[featureLinkField]] = hasBorder ? 2 : 1;
          });
          if (mapId === "global") {
            geoHaveData.forEach(d => {
              // set any geographies that have no data to 2
              if (featureOrder[d] === undefined) {
                featureOrder[d] = 2;
              }
            });
          }

          // update circle ordering
          map.setLayoutProperty(
            sortOrderMetricId + "-fill-outline",
            "line-sort-key",
            ["get", ["get", promoteId], ["literal", featureOrder]]
          );
        }
      }
    } else if (mapId === "us") {
      const hasFillLayers = mapSources[mapId].fill !== undefined;
      if (hasFillLayers) {
        // get data fields to bind data to geo feature
        const featureLinkField = mapSources[mapId].fill.fillLayers.find(
          d => d.id === fill
        ).featureLinkField;
        const promoteId = mapSources[mapId].fill.def.promoteId;

        // get sort order of circles based on covid caseload metric
        const sortOrderMetricId = fill;
        if (sortOrderMetricId === undefined) return;
        else {
          const featureOrder = {};
          data[sortOrderMetricId].forEach(d => {
            const hasBorder =
              d.value === "No restrictions" ||
              d.value === null ||
              d.value === 0;
            featureOrder[d[featureLinkField]] = hasBorder ? 2 : 1;
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
                null,
              ],
              ["get", ["get", promoteId], ["literal", featureOrder]],
              3,
            ]
          );
        }
      }
    }

    // if circle layers are being used, then order circles smallest to
    // biggest for optimal click-ability
    const hasCircleLayers =
      mapSources[mapId].circle !== undefined && circle !== null;
    if (hasCircleLayers) {
      // get data fields to bind data to geo feature
      const featureLinkField = mapSources[mapId].circle.circleLayers.find(
        d => d.id === circle
      ).featureLinkField;
      const promoteId = mapSources[mapId].circle.def.promoteId;

      // get sort order of circles based on covid caseload metric
      const sortOrderMetricId = circle;
      if (sortOrderMetricId === undefined) return;
      else {
        const featureOrder = {};
        data[sortOrderMetricId].forEach(d => {
          featureOrder[d[featureLinkField]] = -d.value;
        });

        // update circle ordering
        map.setLayoutProperty(
          sortOrderMetricId + "-circle",
          "circle-sort-key",
          ["get", ["get", promoteId], ["literal", featureOrder]]
        );
      }
    }
  };

  const updateFillStyles = ({ map }) => {
    // if needed, update fill styles based on data
    const toCheck = ["policy_status_counts"];
    toCheck.forEach(key => {
      if (data[key] !== undefined) {
        const maxVal = d3.max(data[key], d => d.value);
        const minVal = d3.min(data[key], d => d.value);
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

  const getFillLegendName = ({ filters, fill }) => {
    const isLockdownLevel = fill === "lockdown_level";

    const nouns = { plural: "States", singular: "State", level: "state" };
    if (mapId === "global") {
      nouns.plural = "Countries";
      nouns.singular = "Country";
      nouns.level = "national";
    }

    const isPolicyStatus = fill === "policy_status";
    const isPolicyStatusCounts = fill === "policy_status_counts";

    if (isLockdownLevel) {
      return `Distancing level at ${nouns.level.toLowerCase()} level on ${date.format(
        "MMM D, YYYY"
      )}`;
    } else if (isPolicyStatus) {
      const category = filters["primary_ph_measure"][0].toLowerCase();
      const subcategory = !isEmpty(filters["ph_measure_details"])
        ? getAndListString(filters["ph_measure_details"], "or").toLowerCase()
        : undefined;
      const prefix = nouns.plural + " with at least one policy in effect for ";
      const suffix = ` on ${date.format("MMM D, YYYY")}`;
      if (subcategory !== undefined) {
        return <ShowMore text={prefix + subcategory + suffix} charLimit={60} />;
      } else return prefix + category + suffix;
    } else if (isPolicyStatusCounts) {
      const category = filters["primary_ph_measure"][0].toLowerCase();
      const subcategory = !isEmpty(filters["ph_measure_details"])
        ? getAndListString(filters["ph_measure_details"], "or").toLowerCase()
        : undefined;
      const prefix = `Policies in effect at ${nouns.level} level (relative count) for `;
      const suffix = ` on ${date.format("MMM D, YYYY")}`;
      if (subcategory !== undefined) {
        return (
          <ShowMore text={prefix + subcategory + suffix} charLimit={120} />
        );
      } else return prefix + category + suffix;
    }
  };

  /**
   * Revert to default viewport
   * @method resetViewport
   * @return {[type]}       [description]
   */
  const resetViewport = () => {
    const map = mapRef.getMap();

    // hide tooltip and reset button and fly to original position
    setShowTooltip(false);
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
      }
    );
  };

  /**
   * Fly user to specified longlat map location, and (if provided) to the
   * final zoom value -- otherwise the zoom value is 150% of the current
   * zoom value or 8, whichever is smaller.
   * @method flyToLongLat
   * @param  {array}     longlat   Longlat coord in decimal deg
   * @param  {float}     finalZoom Zoom value to end on, or null
   * @param  {object}     viewport  Viewport state variable
   * @param  {object}     mapRef    MapBox map reference object
   * @param  {function}     callback    Optional callback function when done
   */
  const flyToLongLat = (longlat, finalZoom, map, callback = () => {}) => {
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
      easing: function(t) {
        return t;
      },
    });

    // show reset (assuming viewport is not the default one)
    setShowReset(true);
  };

  // prep map data: when data arguments or the mapstyle change, reload data
  // map data updater function
  const getMapData = async dataArgs => {
    const newMapData = await dataGetter(dataArgs);
    setData(newMapData);
  };

  /**
   * Update the current map tooltip
   * @method updateMapTooltip
   * @param  {[type]}         map [description]
   * @return {[type]}             [description]
   */
  const updateMapTooltip = async ({ map }) => {
    if (selectedFeature !== null) {
      setShowTooltip(false);
      const newMapTooltip = (
        <MapTooltip
          {...{
            ...(await tooltipGetter({
              mapId: mapId,
              setMapId,
              d: selectedFeature,
              include: [circle, "lockdown_level"],
              // include: [circle, fill],
              geoHaveData:
                geoHaveData.includes(selectedFeature.properties.BRK_A3) ||
                geoHaveData.includes(selectedFeature.properties.ADM0_A3),
              // include: [circle, fill],
              date,
              map,
              data,
              filters,
              plugins,
              callback: () => {
                setShowTooltip(true);
              },
            })),
          }}
        />
      );
      setMapTooltip(newMapTooltip);
    }
  };

  // EFFECT HOOKS // --------------------------------------------------------//
  // get latest map data if date, filters, or map ID are updated
  useEffect(() => {
    getMapData({ date, filters, mapId });
  }, [filters, mapId]);

  // update map tooltip if the selected feature or metric are updated
  useEffect(() => {
    if (mapRef.getMap !== undefined) {
      const map = mapRef.getMap();
      updateMapTooltip({ map });
    }
  }, [selectedFeature, circle, fill]);

  // update log/lin scale selection for circles
  useEffect(() => {
    if (mapRef.getMap !== undefined) {
      setLinLogCircleStyle();
    }
  }, [linCircleScale]);

  // toggle visibility of map layers if selected metrics or map ID are updated
  useEffect(() => {
    // toggle visible layers based on selections
    if (mapRef.getMap !== undefined) {
      const map = mapRef.getMap();
      if (map.loaded()) {
        // define types of layers that should be checked
        const layerTypeInfo = [
          {
            sourceTypeKey: "circle",
            layerListKey: "circleLayers",
            curOption: circle,
          },
          {
            sourceTypeKey: "fill",
            layerListKey: "fillLayers",
            curOption: fill,
          },
        ];

        // for each type of layer to check, hide the layer and its auxiliary
        // layers if it's not the selected option for that layer type, or
        // show them otherwise
        layerTypeInfo.forEach(({ sourceTypeKey, layerListKey, curOption }) => {
          // are there layers of this type defined in the map sources?
          const hasLayersOfType =
            mapSources[mapId][sourceTypeKey] !== undefined;
          if (hasLayersOfType) {
            // get layers of this type (circle, fill, ...)
            const layersOfType = mapSources[mapId][sourceTypeKey][layerListKey];

            // for each layer determine whether it is visible
            layersOfType.forEach(layer => {
              // if layer is current option, it's visible
              const visible = layer.id === curOption;
              const visibility = visible ? "visible" : "none";
              map.setLayoutProperty(
                layer.id + "-" + sourceTypeKey,
                "visibility",
                visibility
              );

              // same for any associated pattern layers this layer has
              if (layer.styleOptions.pattern === true) {
                map.setLayoutProperty(
                  layer.id + "-" + sourceTypeKey + "-pattern",
                  "visibility",
                  visibility
                );
              }

              // same for circle shadow layers
              if (sourceTypeKey === "circle") {
                map.setLayoutProperty(
                  layer.id + "-" + sourceTypeKey + "-shadow",
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
        });

        // update sort order of circles, etc.
        updateFillOrder({ map, f: null });
      }
    }
  }, [circle, fill, mapId]);

  // initialize or update the map whenever the current map data changes
  useEffect(() => {
    // if no map data, do nothing
    if (data === null) return;
    else {
      const map = mapRef.getMap();

      // if map has not yet loaded
      if (loading) {
        // initialize the map
        initMap({
          map,
          mapId,
          data,
          geoHaveData,
          callback: function afterMapLoaded() {
            // bind feature states to support data driven styling
            bindFeatureStates({ map, mapId, data });

            // load layer images, if any, for pattern layers
            layerImages.forEach(({ asset, name }) => {
              map.loadImage(asset, (error, image) => {
                if (error) throw error;
                map.addImage(name, image);
              });
            });

            // set loading flag to false (this block won't run again for
            // this map)
            setLoading(false);
          },
        });
      } else {
        // if map had already loaded, then just bind feature states using the
        // latest map data
        bindFeatureStates({ map, mapId, data, selectedFeature });
        updateFillOrder({ map, f: null });
        updateFillStyles({ map });
        updateMapTooltip({ map });
      }
    }
  }, [data]);

  // MAP EVENT CALLBACKS // -------------------------------------------------//
  /**
   * Handle map clicks: Select or deselect fill and show / hide tooltips
   * @method handleClick
   * @param  {[type]}    e [description]
   * @return {[type]}      [description]
   */
  const handleClick = e => {
    // allow no interaction until map exists
    if (mapRef.current === null) return;
    else {
      // was the cursor moving on the map?
      const cursorOnMap = e.target.classList.contains("overlays");
      if (!cursorOnMap) return;

      // Get map reference object and sources for map
      const map = mapRef.getMap();
      // allow no interaction until map loaded
      if (!map.loaded()) return;
      else {
        const sources = mapSources[mapId];

        // Get list of features under the mouse cursor.
        const features = map.queryRenderedFeatures(e.point);

        // Get fill and/or circle features that were under the cursor
        // TODO add other layer types as needed, currently only fill and circle
        const fillFeature = features.find(f => {
          return (
            f["layer"]["source-layer"] === sources.fill.sourceLayer &&
            f.layer.type === "fill"
          );
        });
        const circleFeature = features.find(f => {
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
          setShowTooltip(false);
          setSelectedFeature(null);
        }
      }
    }
  };

  /**
   * Handle map mousemoves: highlight hovered fill
   * @method handleMouseMove
   * @param  {[type]}        e [description]
   * @return {[type]}          [description]
   */
  const handleMouseMove = e => {
    // allow no interaction until map exists
    if (mapRef.current === null) return;
    else {
      const map = mapRef.getMap();
      // allow no interaction until map loaded
      if (!map.loaded()) return;
      else {
        // if the cursor is not hovering on the map itself, unhover
        // all features
        const cursorOnMap = e.target.classList.contains("overlays");

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

  // JSX // -----------------------------------------------------------------//
  // render map only after data initially load
  if (data === null) return <div />;
  else
    return (
      <>
        {overlays}

        <ReactMapGL
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          ref={map => {
            mapRef = map;
          }}
          captureClick={true}
          mapStyle={mapStyle.url}
          {...viewport}
          maxZoom={mapStyle.maxZoom}
          minZoom={mapStyle.minZoom}
          onViewportChange={newViewport => {
            // set current viewport state variable to the new viewport
            setViewport(newViewport);
            const lngLatNotDefault =
              newViewport.longitude !== defaultViewport.longitude ||
              newViewport.latitude !== defaultViewport.latitude;
            const zoomNotDefault = newViewport.zoom !== defaultViewport.zoom;

            // If viewport deviates from the default zoom or lnglat, show the
            // "Reset" button, otherwise, hide it
            if (
              (zoomNotDefault || lngLatNotDefault) &&
              !isEmpty(defaultViewport)
            )
              setShowReset(true);
            else setShowReset(false);
          }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onLoad={() => {
            // when map has loaded, add event listener to update the map data
            // whenever the map style, i.e., the type of map, is changed
            const map = mapRef.getMap();

            updateFillOrder({ map, f: null });
            updateFillStyles({ map });
            setLinLogCircleStyle();

            // if default fit bounds are specified, center the viewport on them
            // (fly animation relative to default viewport)
            if (mapStyle.defaultFitBounds !== undefined) {
              const test = () => {
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
                map.off("moveend", test);
              };
              map.on("moveend", test);
              map.fitBounds(mapStyle.defaultFitBounds);
            }

            map.on("styledataloading", function() {
              getMapData();
            });
          }}
          doubleClickZoom={false} //remove 300ms delay on clicking
        >
          {// map tooltip component
          showTooltip && (
            <div className={styles.mapboxMap}>
              <Popup
                id="tooltip"
                longitude={cursorLngLat[0]}
                latitude={cursorLngLat[1]}
                closeButton={false}
                closeOnClick={false}
                captureScroll={true}
                interactive={true}
              >
                {mapTooltip}
              </Popup>
            </div>
          )}
          {
            // map legend
          }
          <div
            className={classNames(styles.legend, {
              [styles.show]: showLegend,
            })}
          >
            <button
              onClick={e => {
                // toggle legend show / hide on button click
                e.stopPropagation();
                e.preventDefault();
                setShowLegend(!showLegend);
              }}
            >
              {showLegend ? "hide legend" : "show legend"}
              <i
                className={classNames("material-icons", {
                  [styles.flipped]: showLegend,
                })}
              >
                play_arrow
              </i>
            </button>
            {true && (
              <div className={classNames(styles.entries, {})}>
                {
                  // fill legend entry
                  // note: legend entries are listed in reverse order
                }
                {circle !== null && (
                  <Legend
                    {...{
                      setInfoTooltipContent: props.setInfoTooltipContent,
                      className: "mapboxLegend",
                      key: "basemap - quantized - " + circle,
                      metric_definition: metricMeta[circle].metric_definition,
                      metric_displayname: (
                        <span>
                          {metricMeta[circle].metric_displayname}
                          {!linCircleScale ? " (log scale)" : ""}
                        </span>
                      ),
                      ...metricMeta[circle].legendInfo.circle,
                    }}
                  />
                )}
                {
                  // circle legend entry
                }
                {fill !== null && (
                  <Legend
                    {...{
                      setInfoTooltipContent: props.setInfoTooltipContent,
                      className: "mapboxLegend",
                      key: "bubble - linear - " + fill,
                      metric_definition: metricMeta[fill].metric_definition,
                      wideDefinition: metricMeta[fill].wideDefinition,
                      metric_displayname: (
                        <span>{getFillLegendName({ filters, fill })}</span>
                      ),
                      ...metricMeta[fill].legendInfo.fill(mapId),
                    }}
                  />
                )}
              </div>
            )}
          </div>
          {showReset && <ResetZoom handleClick={resetViewport} />}
          {
            // map zoom plus and minus buttons
          }
          <div
            style={{
              position: "absolute",
              bottom: "3px",
              left: "5px",
              padding: 0,
            }}
          >
            <NavigationControl />
          </div>
        </ReactMapGL>
      </>
    );
};

// export const geoHaveData = [
//   "AUS",
//   "BRA",
//   "DJI",
//   "EST",
//   "FRA",
//   "IND",
//   "ITA",
//   "JPN",
//   "KOR",
//   "MEX",
//   "MHL",
//   "NGA",
//   "NZL",
//   "PER",
//   "PHL",
//   "SOM",
//   "THA",
//   "USA",
// ];

export default MapboxMap;
