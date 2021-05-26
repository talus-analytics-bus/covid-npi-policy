import React from "react";

/**
 * Define Mapbox sources for geometries, centroids, etc. and styles.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// define map sources to provide features for plotting on the map
export const mapSources = {
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
      name: "centroids-us",
      sourceLayer: "albersusa-points",
      def: {
        type: "vector",
        url: "mapbox://lobenichou.albersusa-points",
        promoteId: "county_fips",
      },
    },
  },

  // additional map types, layer types, and source defs...
  global: {
    // fill: {
    //   name: "geoms",
    //   sourceLayer: "countries_id_rpr",
    //   pattern: true,
    //   def: {
    //     type: "vector",
    //     url: "mapbox://traethethird.4kh7sxxt",
    //     promoteId: "ADM0_A3",
    //   },
    // },
    fill: {
      name: "geoms",
      sourceLayer: "countries_v13c",
      def: {
        type: "vector",
        url: "mapbox://nicoletalus.bnct4toi",
        promoteId: "ADM0_A3",
      },
    },
    circle: {
      name: "centroids",
      sourceLayer: "centroids_v3-abrc0x",
      def: {
        type: "vector",
        url: "mapbox://nicoletalus.3hl37c3u",
        promoteId: "ADM0_A3",
        filter: ["==", ["in", ["get", "ADM0_A3"], ["literal", ["PRI"]]], false],
      },
    },
  },
};

// define map styles to provide base layers for the maps
// each specified style represents a different map instance
export const mapStyles = {
  // map ID (each of these will be rendered as a separate map)
  us: {
    // URL of map style, e.g., mapbox://styles/example_user/example_id
    url: "mapbox://styles/nicoletalus/ckao8n13b0ftm1img9hnywt0f",

    // slug of map, should be map ID
    value: "us",

    // geographic resolution for Metrics database
    geo_res: "state",

    // name of map displayed to user
    name: "US states",

    // min zoom
    minZoom: 3.5,

    // max zoom
    maxZoom: 6,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-21.652727776788545, 15.933811109714933],
      [23.32292033437369, -16.93431157205865],
    ],

    // optional: info tooltip to display for map in radio selections
    tooltip: "View state-level data for the United States only",
  },
  "us-county": {
    // URL of map style, e.g., mapbox://styles/example_user/example_id
    url: "mapbox://styles/nicoletalus/cknp3qduk57mx17l8hkw826st",

    // slug of map, should be map ID
    value: "us-county",

    // geographic resolution for Metrics database
    geo_res: "county",

    // name of map displayed to user
    name: "US counties",

    // min zoom
    minZoom: 3.5,

    // max zoom
    maxZoom: 8,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-21.652727776788545, 15.933811109714933],
      [23.32292033437369, -16.93431157205865],
    ],

    // optional: info tooltip to display for map in radio selections
    tooltip: "View county-level data for the United States only",
  },
  // additional maps...
  global: {
    url: process.env.REACT_APP_GLOBAL_MAP_STYLE_URL,
    value: "global",
    geo_res: "country",
    name: "Countries",
    tooltip: <span>View national-level data for the world</span>,
    minZoom: 1.7246463935904246,
    maxZoom: 6,

    // default fit bounds -- the rectangle that should be optimally displayed
    // in the viewport; the viewport will fly to this position
    defaultFitBounds: [
      [-177.44289170791797, 64.05440369592642],
      [179.97107965372615, -54.77460938717267],
    ],
  },
};
