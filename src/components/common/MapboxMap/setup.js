/**
 * Driver to setup MapboxMap component's sources and layers
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// local components
import { layerStyles } from "./plugins/layers";
import { mapSources } from "./plugins/sources";
import { defaults, mapMetrics } from "./plugins/data";

/**
 * initMap
 * Initializes the MapboxMap component's sources and layers
 * @method initMap
 * @param  {[type]}   map      [description]
 * @param  {[type]}   mapId    [description]
 * @param  {[type]}   data     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export const initMap = ({ map, mapId, data, callback }) => {
  // get sources for current map (see `plugins/sources.js`)
  const sources = mapSources[mapId];

  /**
   * [initGeoms description]
   * @method initGeoms
   * @param  {[type]}  layerData [description]
   * @return {[type]}            [description]
   */
  const initGeoms = () => {
    // add sources for this map (see `plugins/sources.js`)
    addSources(map, mapId);

    map.on("render", handleRender);

    /**
     * After render, check if map is loaded -- if true, trigger callback
     * function from `initMap`, e.g., to bind initial feature states and load
     * images, and unset the onRender event listener; otherwise, do nothing.
     * @method handleRender
     * @return {[type]}     [description]
     */
    function handleRender() {
      if (!map.loaded()) {
        return;
      } // still not loaded; continue

      // remove this handler now that we're done
      map.off("render", handleRender);

      // trigger `initMap` callback function
      callback();
    }

    /**
     * Add fill layers to map geometries
     * @method addFillLayers
     */
    const addFillLayers = () => {
      // get list of fill layers that need to be added from the map metrics
      // definitions (see `plugins/data.js`)
      const fillLayers = mapMetrics[mapId].filter(d => d.for.includes("fill"));

      // if the map has fill layers, continue and add them
      const hasFillLayers =
        sources["fill"] !== undefined && fillLayers.length > 0;
      if (!hasFillLayers) return;
      else {
        // get source for fill from sources list
        const source = sources["fill"];

        // set fill layers for source
        source.fillLayers = fillLayers;

        // for each layer to be added
        fillLayers.forEach(layer => {
          // define layer key by appending fill to layer id
          const layerKey = layer.id + "-fill";

          // get layer style from layer style ID or, if not available, the
          // layer ID
          const layerStyleName =
            (layer.styleId && layer.styleId.fill) || layer.id;

          const layerStyle = layerStyles["fill"][layerStyleName](layer.id);

          // if layer hasn't been added yet, add it, along with auxiliary
          // layer for patterns (not necessarily used)
          if (!map.getLayer(layerKey)) {
            // add main fill layer
            map.addLayer(
              {
                id: layerKey,
                type: "fill",
                source: source.name,
                "source-layer": source.sourceLayer,
                paint: layerStyle,

                // hide layer initially unless it is the current one
                layout: {
                  visibility:
                    defaults[mapId].fill === layer.id ? "visible" : "none"
                }
              },
              // insert this layer just behind the `priorLayer`
              defaults[mapId].priorLayer
            );

            // add auxiliary pattern layer so fill colors can be mixed with
            // fill patterns (not necessarily used)
            // TODO add error checking in case pattern style undefined
            if (layer.styleOptions.pattern === true) {
              map.addLayer(
                {
                  id: layerKey + "-pattern",
                  type: "fill",
                  source: source.name,
                  "source-layer": source.sourceLayer,

                  // set pattern style from `plugins/layers.js`
                  paint: layerStyles["fill"][layerStyleName + "-pattern"](
                    layer.id
                  ),

                  // hide layer initially unless it is the current one
                  layout: {
                    visibility:
                      defaults[mapId].fill === layer.id ? "visible" : "none"
                  }
                },

                // insert this layer just behind the `priorLayer`
                defaults[mapId].priorLayer
              );
            }

            // set layer filter if one provided
            if (layer.filter !== undefined)
              map.setFilter(layerKey, layer.filter);

            // if outlines shown for this layer, draw them using the available
            // outline style for this layer
            // TODO add error checking in case outline style undefined
            if (layer.styleOptions.outline === true) {
              const outlineId = layerKey + "-outline";
              if (!map.getLayer(outlineId)) {
                map.addLayer(
                  {
                    id: outlineId,
                    type: "line",
                    source: source.name,
                    "source-layer": source.sourceLayer,
                    paint: layerStyles["fill"][layerStyleName + "-outline"](
                      layer.id
                    )
                  },
                  // insert this layer just behind the `priorLayer`
                  defaults[mapId].priorLayer
                );
                if (layer.filter !== undefined)
                  map.setFilter(outlineId, layer.filter);
              }
            }
          }
        });
      }
    };

    /**
     * Add circle layers to map centroids
     * @method addCircleLayers
     */
    const addCircleLayers = () => {
      // get all circle layers to add
      const layers = mapMetrics[mapId].filter(d => d.for.includes("circle"));

      // if there are none, return, otherwise continue adding
      const hasLayers = sources["circle"] !== undefined && layers.length > 0;
      if (!hasLayers) return;
      else {
        // get source for centroids of circle
        const source = sources["circle"];

        // set layers
        source.circleLayers = layers;

        // for each circle layer
        layers.forEach(layer => {
          // get style for this layer
          const layerStyleName =
            (layer.styleId && layer.styleId.circle) || layer.id;
          const layerStyle = layerStyles["circle"][layerStyleName](layer.id);

          // define key for layer (unique ID)
          const layerKey = layer.id + "-circle";

          // if layer doesn't exist yet, add it, along with any applicable
          // auxiliary layers
          if (!map.getLayer(layerKey)) {
            // define circle shadow style
            const circleShadowStyle = {
              "circle-radius-transition": {
                duration: 1000,
                delay: 0
              },
              "circle-translate": [3, 3],
              "circle-radius": layerStyle.circleRadius,
              "circle-blur": 0.25,
              "circle-color": "transparent",
              "circle-opacity": [
                "case",
                ["==", ["feature-state", layer.id], null],
                0,
                0.25
              ],
              "circle-stroke-width": [
                "case",
                ["==", ["feature-state", "clicked"], true],
                layerStyle.circleStrokeWidth * 2,
                ["==", ["feature-state", "hovered"], true],
                layerStyle.circleStrokeWidth * 2,
                layerStyle.circleStrokeWidth
              ],
              "circle-stroke-color": [
                "case",
                ["==", ["feature-state", layer.id], null],
                "transparent",
                "black"
              ],
              "circle-stroke-opacity": 0.25
            };

            // define circle main style
            const circleMainStyle = {
              "circle-radius-transition": {
                duration: 1000,
                delay: 1000
              },
              "circle-radius": layerStyle.circleRadius,
              "circle-color": layerStyle.circleColor,
              "circle-opacity": layerStyle.circleOpacity,
              "circle-stroke-width": [
                "case",
                ["==", ["feature-state", "clicked"], true],
                layerStyle.circleStrokeWidth * 2,
                ["==", ["feature-state", "hovered"], true],
                layerStyle.circleStrokeWidth * 2,
                layerStyle.circleStrokeWidth
              ],
              "circle-stroke-color": layerStyle.circleStrokeColor,
              "circle-stroke-opacity": layerStyle.circleStrokeOpacity
            };

            // add circle shadow layer first
            map.addLayer(
              {
                id: layerKey + "-shadow",
                type: "circle",
                source: source.name,
                "source-layer": source.sourceLayer,
                paint: circleShadowStyle,

                // hide layer initially unless it is the current one
                layout: {
                  visibility:
                    defaults[mapId].circle === layer.id ? "visible" : "none"
                }
              },
              // insert this layer just behind the `priorLayer`
              defaults[mapId].priorLayer
            );

            // add circle layer
            map.addLayer(
              {
                id: layerKey,
                type: "circle",
                source: source.name,
                "source-layer": source.sourceLayer,
                paint: circleMainStyle,

                // hide layer initially unless it is the current one
                layout: {
                  visibility:
                    defaults[mapId].circle === layer.id ? "visible" : "none"
                }
              },
              // insert this layer just behind the `priorLayer`
              defaults[mapId].priorLayer
            );

            // apply filters to main circle and shadow if applicable
            if (layer.filter !== undefined) {
              map.setFilter(layerKey + "-shadow", layer.filter);
              map.setFilter(layerKey, layer.filter);
            }
          }
        });
      }
    };

    // add layers
    addFillLayers();
    addCircleLayers();
  };

  // if map already loaded, add geometries
  if (map.loaded()) {
    initGeoms();
  }
  // otherwise, when map is loaded, add geometries
  map.on("load", function() {
    initGeoms();
  });
};

/**
 * addSources
 * Add all sources for map described in `plugins/sources.js`
 * @method addSources
 * @param  {[type]}   map   [description]
 * @param  {[type]}   mapId [description]
 */
export const addSources = (map, mapId) => {
  // get sources from plugin data
  const sources = mapSources[mapId];

  // add sources
  for (const [, v] of Object.entries(sources)) {
    if (!map.getSource(v.name)) {
      map.addSource(v.name, v.def);
    }
  }
};

/**
 * bindFeatureStates
 * Add data to feature states to support data-driven styling for the current
 * map data
 * @method bindFeatureStates
 * @param  {[type]}          map             [description]
 * @param  {[type]}          mapId           [description]
 * @param  {[type]}          data            [description]
 * @param  {[type]}          selectedFeature [description]
 * @return {[type]}                          [description]
 */
export const bindFeatureStates = ({ map, mapId, data, selectedFeature }) => {
  const sources = mapSources[mapId];
  const curMapMetrics = mapMetrics[mapId];
  bindFeatureStatesForSource({
    map,
    mvmNew: mapSources[mapId],
    data,
    curMapMetrics,
    selectedFeature
  });
};

/**
 * bindFeatureStatesForSource
 * For the given source, iterates over the features and binds any `data`
 * elements to it that match the feature
 * @method bindFeatureStatesForSource
 * @param  {[type]}                   map             [description]
 * @param  {[type]}                   sourceTypeKey   [description]
 * @param  {[type]}                   source          [description]
 * @param  {[type]}                   data            [description]
 * @param  {[type]}                   selectedFeature [description]
 * @return {[type]}                                   [description]
 */
const bindFeatureStatesForSource = ({
  map,
  // sourceTypeKey,
  // source,
  mvmNew,
  data,
  curMapMetrics,
  selectedFeature
}) => {
  for (const [sourceTypeKey, source] of Object.entries(mvmNew)) {
    // define standard layer list key, e.g., 'circleLayers', 'fillLayers', ...
    const layerListKey = sourceTypeKey + "Layers";

    // first erase original feature state for all features
    curMapMetrics.forEach(layer => {
      // get all features from source, using filter if defined
      const feats = map.querySourceFeatures(source.name, {
        sourceLayer: source.sourceLayer,
        filter: layer.filter
      });

      // get trend key (only applicable if trend is being tracked)
      const trendKey = layer.id.toString() + "-trend";
      // iterate over features and erase feature state relevant to this layer
      feats.forEach(f => {
        map.setFeatureState(
          {
            source: source.name,
            sourceLayer: source.sourceLayer,
            id: f.id
          },
          { [layer.id]: null, [trendKey]: null }
        );
      });
    });
  }

  // for each layer defined for the source, get the data for that layer and
  // bind it to any matching features in the source
  curMapMetrics.forEach(layer => {
    // get data for layer features
    const layerData = data[layer.id];
    layerData.forEach(dd => {
      // bind null value to feature if no data
      const state = {};
      if (dd.value === undefined || dd.value === null) {
        state.nodata = true;
        state[layer.id] = null;
      } else {
        // otherwise, bind data
        state.nodata = false;
        state[layer.id] = dd.value;
      }

      // if layer incorporates trends, then look for and bind any trend data
      // to the layer
      const lookForTrendData = layer.trend === true;
      if (lookForTrendData) {
        // define standard trend key, e.g., "metric_name-trend"
        const trendKey = layer.id + "-trend";

        // get trend datum associated with this main datum, if any
        const trend = data[trendKey].find(
          ddd => ddd.place_id === dd.place_id && ddd.end_date === dd.date_time
        );

        // if one was found, calculate the percent change from 0..100 and add
        // that value to the state
        if (trend !== undefined) {
          if (trend.start_obs === 0 && trend.end_obs !== 0) {
            state[trendKey] = +Infinity;
          } else if (trend.start_obs === 0 && trend.end_obs === 0) {
            state[trendKey] = 0;
          } else {
            state[trendKey] =
              (100 * (trend.end_obs - trend.start_obs)) / trend.start_obs;
          }
        }
      }

      // bind updated feature state to any feature that matches the
      // feature props
      for (const [sourceTypeKey, source] of Object.entries(mvmNew)) {
        const featureProps = {
          source: source.name,
          sourceLayer: source.sourceLayer,
          id: dd[layer.featureLinkField || "place_id"]
        };
        console.log("\nlayer");
        console.log(layer);
        console.log("dd");
        console.log(dd);
        console.log("featureProps");
        console.log(featureProps);
        map.setFeatureState(featureProps, state);
      }
    });
  });
};

// /**
//  * Returns true if datum is 3 or more months old, false otherwise.
//  * @method getStaleStatus
//  */
// const getStaleStatus = (obs, timeFrame = "month") => {
//   if (obs["stale_flag"] === true) {
//     const today = Util.today();
//     const date_time = obs["date_time"].replace(/-/g, "/");
//     const then = new Date(date_time);
//     switch (timeFrame) {
//       case "month":
//         if (today.getUTCMonth() - then.getUTCMonth() > 3) return true;
//         else return false;
//       case "year":
//         if (today.getUTCYear() - then.getUTCYear() > 3) return true;
//         else return false;
//     }
//   } else return false;
// };

export default initMap;
