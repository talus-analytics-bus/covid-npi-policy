/**
 * Define Mapbox layer styles, images, etc.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// 3rd party packages
import * as d3 from "d3/dist/d3.min";
import moment from "moment";

// utilities
import { getLog10Scale, comma } from "../../../misc/Util";

// assets
import dots from "./assets/images/dots.png";
// No policy
// Unclear
// New open
// Safer at home
// Stay at home

// constants
// define default pattern style used below
const defaultPatternStyle = key => {
  return {
    "fill-pattern": "dots",
    "fill-opacity": [
      "case",
      ["==", ["feature-state", key], null],
      0,
      ["<", ["feature-state", key], 25],
      1,
      0
    ]
  };
};

// define circle styles
// each key corresponds to a style, or to a layer ID that uses the style.
// The styles may be referenced in `../setup.js` directly by layer ID or by a
// style ID which is specified in the `./layers.js` as `styleId`.
//
// The value of each key is a function that returns a data-driven style based
// on the feature state defined by the `key` passed as an argument. Styles that
// are not data-driven should be represented as functions without any arguments
const circleStyles = {
  "metric-test-transp": key => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "white"
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36"
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (key === "-9997" || key === "-9999")
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e4,
            featurePropertyKey: key
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e9,
            featurePropertyKey: key
          });
      }
    };
  },
  "metric-test-solid": key => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36"
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36"
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (key === "-9997" || key === "-9999")
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e4,
            featurePropertyKey: key
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e9,
            featurePropertyKey: key
          });
      }
    };
  }
};

// similar for fill styles
const fillStyles = {
  "metric-test-pattern": key => {
    return defaultPatternStyle(key);
  },
  "metric-test-outline": key => {
    return {
      "line-color": "#ffffff",
      "line-width": [
        "case",
        ["==", ["feature-state", "clicked"], true],
        6,
        ["==", ["feature-state", "hovered"], true],
        6,
        2
      ]
    };
  },
  "metric-test": key => {
    return {
      "fill-color": [
        "case",
        ["==", ["feature-state", key], null],
        "#eaeaea",
        ["<", ["feature-state", key], 25],
        "transparent",
        ["<", ["feature-state", key], 50],
        "#BBDAF5",
        ["<", ["feature-state", key], 75],
        "#86BFEB",
        "#549FE2"
      ]
    };
  },
  policy_status: key => {
    return {
      "fill-color": [
        "case",
        ["==", ["feature-state", key], null],
        "#eaeaea",
        ["==", ["feature-state", key], "policy in place"],
        "#66CAC4",
        "#eaeaea"
      ]
    };
  },
  get "policy_status-outline"() {
    return this["metric-test-outline"];
  },
  // LOCKDOWN LEVEL STYLING
  lockdown_level: key => {
    return {
      "fill-color": [
        "case",
        ["==", ["feature-state", key], null],
        "#eaeaea",
        ["==", ["feature-state", key], "Unclear lockdown level"],
        "transparent",
        ["==", ["feature-state", key], "New open"],
        "#BBDAF5",
        ["==", ["feature-state", key], "Safer at home"],
        "#86BFEB",
        ["==", ["feature-state", key], "Stay at home"],
        "#549FE2",
        "#eaeaea"
      ]
    };
  },
  "lockdown_level-pattern": key => {
    return {
      "fill-pattern": "dots",
      "fill-opacity": [
        "case",
        ["==", ["feature-state", key], "Unclear lockdown level"],
        1,
        0
      ]
    };
  },
  get "lockdown_level-outline"() {
    return this["policy_status-outline"];
  }
};

// define layer styles
export const layerStyles = {
  circle: circleStyles,
  fill: fillStyles
};

// define images used by layers -- if none, then provide empty array
export const layerImages = [
  {
    name: "dots",
    asset: dots
  }
];
