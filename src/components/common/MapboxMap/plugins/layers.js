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

// utilities
import { getLog10Scale, getLinearScale } from "../../../misc/Util";
// import { geoHaveData } from "../MapboxMap";

// assets
// import dots from "./assets/images/dots.png";

// constants
// define default pattern style used below
const defaultPatternStyle = key => {
  return {
    // "fill-pattern": "dots",
    "fill-opacity": [
      "case",
      ["==", ["feature-state", key], null],
      0,
      ["<", ["feature-state", key], 25],
      1,
      0,
    ],
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
  "metric-test-transp": (key, linCircleScale = false) => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "white",
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 1,
            zeroSize: 1,
            maxValue: 150e3 / 7.0,
            maxSize: 15,
            featurePropertyKey: key,
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e7 / 7.0,
            featurePropertyKey: key,
          });
      },
    };
  },
  "metric-test-transp-global": (key, linCircleScale = true) => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "white",
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1.3e6,
            // maxSize: 20,
            featurePropertyKey: key,
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e9,
            featurePropertyKey: key,
          });
      },
    };
  },

  // global
  "metric-test-solid-global": (key, linCircleScale = true) => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 15e6,
            featurePropertyKey: key,
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e7,
            featurePropertyKey: key,
          });
      },
    };
  },
  "metric-test-solid": (key, linCircleScale = false) => {
    return {
      circleColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#333",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleOpacity: 0.5,
      circleStrokeColor: [
        "case",
        ["==", ["feature-state", key], 0],
        "#b3b3b3",
        ["==", ["feature-state", key], null],
        "transparent",
        "#e65d36",
      ],
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 1,
            zeroSize: 1,
            maxValue: 1.5e6,
            maxSize: 15,
            featurePropertyKey: key,
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e9,
            featurePropertyKey: key,
          });
      },
    };
  },
};

// colors
const noDataColor = "#eaeaea";
const noDataBorder = "#ffffff";
const negColor = "#ffffff";
const negBorder = "#808080";
const lightTeal = "#e0f4f3";
const teal = "#66CAC4";
// const medTeal = "#41beb6";
const darkTeal = "#349891";
export const greenStepsScale = d3
  .scaleLinear()
  .domain([0, 1]) // TODO dynamically
  .range([lightTeal, darkTeal]);

const getLinearColorBins = ({ nBins, scale, maxVal, minVal, key }) => {
  const diff = maxVal - minVal;
  const binSize = diff / 5;
  const breakpoints = [1, 2, 3, 4].map(d => {
    return binSize * d + minVal;
  });
  const colors = scale.range();
  const newColorScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range(colors);

  // const base = ["case"];
  const base = ["case", ["==", ["feature-state", key], 0], "#ffffff"];
  breakpoints.forEach((v, i) => {
    base.push(["<=", ["feature-state", key], v]);
    base.push(newColorScale(i * 0.25));
  });
  base.push(newColorScale(1));
  return base;

  // OLD VERSION BELOW
  // const range = scale.range();
  // const newScale = d3
  //   .scaleLinear()
  //   .domain([0, 1])
  //   .range(range);
  // const base = ["case"];
  // const capVal = maxVal - minVal;
  // const nRules = nBins - 1;
  // const binStep = 1 / (nBins - 1);
  // for (let i = 0; i < nRules; i++) {
  //   const val = ((i + 1) * capVal) / (nBins + 1) + minVal;
  //   base.push(["<=", ["feature-state", key], val]);
  //   base.push(newScale(i * binStep));
  // }
  // // add max color
  // base.push(newScale(1));
  // return base;
};

// similar for fill styles
const fillStyles = {
  "metric-test-pattern": key => {
    return defaultPatternStyle(key);
  },
  "metric-test-outline": (key, geoHaveData) => {
    return {
      "line-color": [
        "case",
        ["==", ["feature-state", key], "t"],
        "#ffffff",
        ["==", ["has", "state_name"], true], // all states are reporting data
        negBorder,
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataBorder,
        "#ffffff",
      ],
      "line-width": [
        "case",
        ["==", ["feature-state", "clicked"], true],
        2,
        ["==", ["feature-state", "hovered"], true],
        2,
        1,
      ],
    };
  },

  // TODO redo all this based on new API responses for `include_zeros = true`
  policy_status_counts: (key, geoHaveData, maxVal = 1, minVal = 0) => {
    return {
      "fill-color": [
        "case",
        ["!=", ["feature-state", key], null],
        getLinearColorBins({
          nBins: 5,
          scale: greenStepsScale,
          maxVal,
          minVal,
          key,
        }),
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataColor,
        ["==", ["feature-state", key], null],
        negColor,
        negColor,
      ],
    };
  },
  "policy_status_counts-outline": (key, geoHaveData) => {
    return {
      "line-color": [
        "case",
        ["==", ["feature-state", key], 0],
        negBorder,
        ["!=", ["feature-state", key], null],
        "#ffffff",
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataBorder,
        ["==", ["feature-state", key], null],
        negBorder,
        "#ffffff",
      ],
      "line-width": [
        "case",
        ["==", ["feature-state", "clicked"], true],
        2,
        ["==", ["feature-state", "hovered"], true],
        2,
        1,
      ],
    };
  },

  policy_status: (key, geoHaveData) => {
    return {
      "fill-color": [
        "case",
        ["==", ["feature-state", key], "t"],
        "#66CAC4",
        ["==", ["has", "state_name"], true],
        negColor,
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataColor,
        ["==", ["feature-state", key], null],
        negColor,
        negColor,
      ],
    };
  },
  "policy_status-outline": (key, geoHaveData) => {
    return {
      "line-color": [
        "case",
        ["==", ["feature-state", key], "t"],
        "#ffffff",
        ["==", ["has", "state_name"], true], // all states are reporting data
        negBorder,
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataBorder,
        ["==", ["feature-state", key], null],
        negBorder,
        "#ffffff",
      ],
      "line-width": [
        "case",
        ["==", ["feature-state", "clicked"], true],
        2,
        ["==", ["feature-state", "hovered"], true],
        2,
        1,
      ],
    };
  },
  // LOCKDOWN LEVEL STYLING
  lockdown_level: (key, geoHaveData) => {
    return {
      "fill-color": [
        "case",
        ["==", ["feature-state", key], "Mixed distancing levels"],
        "transparent",
        ["==", ["feature-state", key], "Open"],
        "#e9f3fc",
        ["==", ["feature-state", key], "Partially open"],
        "#BBDAF5",
        ["==", ["feature-state", key], "New normal"],
        "#BBDAF5",
        ["==", ["feature-state", key], "Safer at home"],
        "#86BFEB",
        ["==", ["feature-state", key], "Stay at home"],
        "#549FE2",
        ["==", ["feature-state", key], "Lockdown"],
        "#2165a1",
        ["==", ["has", "state_name"], true],
        "#e9f3fc",
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataColor,
        ["==", ["feature-state", key], null],
        "#e9f3fc",
        negColor,
      ],
    };
  },
  // "lockdown_level-pattern": key => {
  //   return {
  //     "fill-pattern": "dots",
  //     "fill-opacity": [
  //       "case",
  //       ["==", ["feature-state", key], "Mixed distancing levels"],
  //       1,
  //       0,
  //     ],
  //   };
  // },
  "lockdown_level-outline": (key, geoHaveData) => {
    return {
      "line-color": [
        "case",
        ["==", ["feature-state", key], "Mixed distancing levels"],
        "white",
        ["==", ["feature-state", key], "Open"],
        "white",
        ["==", ["feature-state", key], "Partially open"],
        "white",
        ["==", ["feature-state", key], "New normal"],
        "white",
        ["==", ["feature-state", key], "Safer at home"],
        "white",
        ["==", ["feature-state", key], "Stay at home"],
        "white",
        ["==", ["feature-state", key], "Lockdown"],
        "white",
        ["==", ["has", "state_name"], true],
        "white",
        ["==", ["in", ["get", "ADM0_A3"], ["literal", geoHaveData]], false],
        noDataBorder,
        ["==", ["feature-state", key], null],
        "white",
        negBorder,
      ],
      "line-width": [
        "case",
        ["==", ["feature-state", "clicked"], true],
        2,
        ["==", ["feature-state", "hovered"], true],
        2,
        1,
      ],
    };
  },
};

// define layer styles
export const layerStyles = {
  circle: circleStyles,
  fill: fillStyles,
};

// define images used by layers -- if none, then provide empty array
export const layerImages = [
  // {
  //   name: "dots",
  //   asset: dots,
  // },
];
