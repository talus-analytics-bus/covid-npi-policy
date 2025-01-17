import React from "react";
import { MapId, MapSources } from "./mapTypes";
import { GeoRes } from "api/queryTypes";

/**
 * Define Mapbox sources for geometries, centroids, etc. and styles.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// constants
/**
 * Mapbox style ID of US map
 */
const US_MAP_ID: string = "ckq9vwu8t0w4w17k0nwj4z9kz";

// define map sources to provide features for plotting on the map
export const mapSources: MapSources = {
  // map ID
  us: {
    // layer type that will be driven by this source
    // TODO allow more than one per source
    fill: {
      // name of source
      name: "geoms-us",

      // source layer for this layer type
      sourceLayer: "albersusa",

      // source definition data that are used by Mapbox API
      // NOTE: `def.name` may be required for non-vector sources to define the
      // name of the source
      def: {
        // source type, e.g., 'vector'
        type: "vector",

        // source URL, e.g., mapbox://example.example
        url: "mapbox://lobenichou.albersusa",

        // optional: the data field in each feature's properties that should be
        // used as the unique ID for that feature, if not simply `id`
        promoteId: "state_name",
      },
    },

    // additional layer types and source defs...
    circle: {
      name: "centroids-us",
      sourceLayer: "albersusa-points",
      def: {
        type: "vector",
        url: "mapbox://lobenichou.albersusa-points",
        promoteId: "state_name",
      },
    },
  },
  "us-county": {
    // layer type that will be driven by this source
    // TODO allow more than one per source
    fill: {
      // name of source
      name: "geoms-us",

      // source layer for this layer type
      sourceLayer: "albersusa",

      // source definition data that are used by Mapbox API
      // NOTE: `def.name` may be required for non-vector sources to define the
      // name of the source
      def: {
        // source type, e.g., 'vector'
        type: "vector",

        // source URL, e.g., mapbox://example.example
        url: "mapbox://lobenichou.albersusa",

        // optional: the data field in each feature's properties that should be
        // used as the unique ID for that feature, if not simply `id`
        promoteId: "county_fips",
      },
    },

    // additional layer types and source defs...
    circle: {
      name: "centroids-us-county",
      sourceLayer: "albersusa-points",
      def: {
        type: "vector",
        url: "mapbox://lobenichou.albersusa-points",
        promoteId: "county_fips",
        minzoom: 7,
        zoomLabel: "for counties",
      },
    },
    "circle-state": {
      name: "centroids-us-state",
      sourceLayer: "albersusa-points",
      def: {
        type: "vector",
        url: "mapbox://lobenichou.albersusa-points",
        promoteId: "state_name",
        maxzoom: 7,
        zoomLabel: "for states",
      },
    },
  },
  get "us-county-plus-state"() {
    return this["us-county"];
  },

  // additional map types, layer types, and source defs...
  global: {
    fill: {
      name: "geoms",
      sourceLayer: "countries_slim_v13c03", // generated from:
      def: {
        type: "vector",
        url: "mapbox://nicoletalus.92q1pclg",
        promoteId: "ISO_A3",
      },
    },
    circle: {
      name: "centroids",
      sourceLayer: "centroids_v4c_slim-an20gc",
      //  sourceLayer: "centroids_v4b_slim-0s8vf9",
      // sourceLayer: "centroids_v4_slim-1bw67n",
      //  sourceLayer: "centroids_v3-abrc0x",
      // sourceLayer: "centroids_v4_slim",
      def: {
        type: "vector",
        url: "mapbox://nicoletalus.3a8qy0w1",
        promoteId: "ISO_A3",
        filter: [
          "==",
          ["in", ["get", "ISO_A3"], ["literal", ["PRI", "GBR"]]],
          false,
        ],
      },
    },
  },
};

// define map styles to provide base layers for the maps
// each specified style represents a different map instance
export const mapStyles = {
  // map ID (each of these will be rendered as a separate map)
  [MapId.us]: {
    // URL of map style, e.g., mapbox://styles/example_user/example_id
    url: `mapbox://styles/nicoletalus/${US_MAP_ID}`,

    // slug of map, should be map ID
    value: "us",

    // geographic resolution for Metrics database
    geo_res: GeoRes.state,

    // name of map displayed to user
    name: "US states",

    // min zoom
    minZoom: 3.5,

    // max zoom
    maxZoom: 5.9,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-21.155989509715667, 15.597516194781097],
      [33.240006846583366, -20.418786807120235],
    ],

    // optional: info tooltip to display for map in radio selections
    tooltip: "View state-level data for the United States only",
  },
  [MapId.us_county]: {
    // URL of map style, e.g., mapbox://styles/example_user/example_id
    url: `mapbox://styles/nicoletalus/${US_MAP_ID}`,

    // slug of map, should be map ID
    value: "us-county",

    // geographic resolution for Metrics database
    geo_res: GeoRes.county,

    // name of map displayed to user
    name: "US counties",

    // min zoom
    minZoom: 3.5,

    // max zoom
    maxZoom: 8,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-21.155989509715667, 15.597516194781097],
      [33.240006846583366, -20.418786807120235],
    ],

    // optional: info tooltip to display for map in radio selections
    tooltip: "View county-level data for the United States only",
  },
  get [MapId.us_county_plus_state]() {
    return {
      ...this["us-county"],
      value: "us-county-plus-state",
      geo_res: GeoRes.county_plus_state,
    };
  },
  // additional maps...
  [MapId.global]: {
    url: process.env.REACT_APP_GLOBAL_MAP_STYLE_URL || "",
    value: "global",
    geo_res: GeoRes.country,
    name: "Countries",
    attribution: true,
    tooltip: <span>View national-level data for the world</span>,
    minZoom: 1.7246463935904246,
    maxZoom: 6,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-141.78623293980732, 60.46188253859922],
      [179.97107965372615, -54.77460938717267],
    ],
  },
};
