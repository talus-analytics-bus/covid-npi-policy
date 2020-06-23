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
        promoteId: "state_name"
      }
    },

    // additional layer types and source defs...
    circle: {
      name: "centroids-us",
      sourceLayer: "albersusa-points",
      def: {
        type: "vector",
        url: "mapbox://lobenichou.albersusa-points",
        promoteId: "state_name"
      }
    }
  },

  // additional map types, layer types, and source defs...
  global: {
    fill: {
      name: "geoms",
      sourceLayer: "countries_id_rpr",
      pattern: true,
      def: {
        type: "vector",
        url: "mapbox://traethethird.4kh7sxxt"
      }
    },
    circle: {
      name: "centroids",
      sourceLayer: "mvmupdatescentroidsv2-62u4it",
      def: {
        type: "vector",
        url: "mapbox://nicoletalus.c4ujj0o1",
        promoteId: "id"
      }
    }
  }
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

    // name of map displayed to user
    name: "US only",

    // min zoom
    minZoom: 3.5,

    // max zoom
    maxZoom: 6,

    // default viewport of map to show when toggled to or initialized
    defaultViewport: {
      height: "100%",
      width: "100%",
      latitude: -0.004384783051767765,
      longitude: -0.7804759636200538,
      zoom: 4.220136939244611
    },

    // optional: info tooltip to display for map in radio selections
    tooltip: "View state-level data for the United States only"
  },

  // additional maps...
  global: {
    url: "mapbox://styles/nicoletalus/ckaofpis006y41ik5mr49kjnd",
    value: "global",
    name: "Global",
    tooltip: (
      <span>
        <b>Currently in development</b>: View country-level data for the world.
      </span>
    ),
    minZoom: 1.5,
    maxZoom: 6,
    defaultViewport: {
      height: "100%",
      width: "100%",
      latitude: 19.72983258604616,
      longitude: 9.514188701842533,
      zoom: 2
    }
  }
};
