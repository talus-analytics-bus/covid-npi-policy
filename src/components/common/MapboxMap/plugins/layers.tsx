/**
 * Define Mapbox layer styles, images, etc.
 * All data elements are defined in `plugins` directory on a per-project basis.
 * `plugins/data.js` defines metric metadata, metric data getter methods, etc.,
 *    , and default settings
 * `plugins/sources.js` defines the map sources and styles.
 * `plugins/layers.js` defines the layers and styles
 */

// 3rd party packages
import * as d3 from "d3";

// assets and styles
import varsExports from "assets/styles/vars.module.scss";

// utilities
import {
  getLog10Scale,
  getLinearScale,
  range,
} from "components/misc/UtilsTyped";
import { CircleStyles, FillStyles } from "./mapTypes";
// import { geoHaveData } from "../MapboxMap";

// assets
// import dots from "./assets/images/dots.png";

// constants
// colors imported from vars.module.scss
const {
  mapGreen1,
  mapGreen2,
  mapGreen3,
  mapGreen4,
  mapGreen5,
  mapGreen6,
  noDataGray,
  zeroGray,
} = varsExports;

// define default pattern style used below
const defaultPatternStyle = (key: string) => {
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

// GENERAL CIRCLE PROPERTIES // -------------------------------------------- //
const getCircleOpacity: (key: string) => any[] = (key: string) => [
  "case",
  ["==", ["feature-state", key], null],
  1,
  0.25,
];

// SOLID CIRCLE PROPERTIES // ---------------------------------------------- //
function getSolidCircleColor(key: string): any {
  return [
    "case",
    ["==", ["feature-state", key], 0],
    "white",
    ["==", ["feature-state", key], null],
    "transparent",
    "#e65d36",
  ];
}

function getSolidCircleStrokeColor(key: string): any {
  return [
    "case",
    ["==", ["feature-state", key], 0],
    zeroGray,
    ["==", ["feature-state", key], null],
    "transparent",
    "#e65d36",
  ];
}

// TRANSP CIRCLE PROPERTIES // --------------------------------------------- //
function getTranspCircleColor(key: string): any {
  return [
    "case",
    ["==", ["feature-state", key], 0],
    "white",
    ["==", ["feature-state", key], null],
    noDataGray,
    "white",
  ];
}

function getTranspCircleStrokeColor(key: string): any {
  return [
    "case",
    ["==", ["feature-state", key], 0],
    zeroGray,
    ["==", ["feature-state", key], null],
    "transparent",
    "#e65d36",
  ];
}

const circleStyles: CircleStyles = {
  "circle-transp-usa": (key, linCircleScale = false) => {
    return {
      circleColor: getTranspCircleColor(key),
      circleOpacity: getCircleOpacity(key),
      circleStrokeColor: getTranspCircleStrokeColor(key),
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 1,
            zeroSize: 0.5,
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
  "circle-transp-global": (key, linCircleScale = true) => {
    return {
      circleColor: getTranspCircleColor(key),
      circleOpacity: getCircleOpacity(key),
      circleStrokeColor: getTranspCircleStrokeColor(key),
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 3,
            zeroSize: 2,
            maxValue: 1.3e6 / 7,
            featurePropertyKey: key,
          });
        else
          return getLog10Scale({
            minSize: 5,
            zeroSize: 5,
            maxValue: 1e9 / 7,
            featurePropertyKey: key,
          });
      },
    };
  },

  // global
  "circle-solid-global": (key, linCircleScale = true) => {
    return {
      circleColor: getSolidCircleColor(key),
      circleOpacity: getCircleOpacity(key),
      circleStrokeColor: getSolidCircleStrokeColor(key),
      circleStrokeOpacity: 1,
      circleStrokeWidth: 3,
      get circleRadius() {
        if (linCircleScale)
          return getLinearScale({
            minSize: 3,
            zeroSize: 2,
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
  "circle-solid-usa": (key, linCircleScale = false) => {
    return {
      circleColor: getSolidCircleColor(key),
      circleOpacity: getCircleOpacity(key),
      circleStrokeColor: getSolidCircleStrokeColor(key),
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
const noDataColor = noDataGray;
const noDataBorder = "#ffffff";
const negColor = "#ffffff";
const negBorder = "#808080";
const lightTeal = "#e0f4f3";
const darkTeal = "#349891";
export const greenStepsScale = d3
  .scaleLinear<string, number>()
  .domain([0, 1])
  .range([lightTeal, darkTeal]);

interface GetQuantizedColorStyleProps {
  colors: string[];
  maxVal: number;
  minVal: number;
  key: string;
}

/**
 * Given a series of colors, the max and min values of the data series, and the
 * key for the data series, returns a Mapbox styling expression that returns
 * the colors in the series according to a quantized color scale with
 * breakpoints linearly determined by the values.
 * @param {Object} o The parameters
 * @param {string[]} o.colors The color series
 * @param {string} o.key The key for the data series in the data object
 * @param {number} o.minVal The smallest value in the data series
 * @param {number} o.maxVal The largest value in the data series
 * @returns {Array<any>}
 * Mapbox expression styling values with quantized color scale using linear
 * and evenly-sized bins.
 */
const getQuantizedColorStyle: Function = ({
  colors,
  maxVal,
  minVal,
  key,
}: GetQuantizedColorStyleProps): any[] => {
  const nBins = colors.length;
  const diff = maxVal - minVal;
  const binSize = diff / nBins;

  const breakpoints = range(1, nBins - 1).map(d => {
    return binSize * d + minVal;
  });

  const base = ["case", ["==", ["feature-state", key], 0], "#ffffff"];
  breakpoints.forEach((v, i) => {
    base.push(["<=", ["feature-state", key], v]);
    base.push(colors[i]);
  });
  base.push(colors[colors.length - 1]);
  return base;
};

// similar for fill styles
const fillStyles: FillStyles = {
  "pattern-general": key => {
    return defaultPatternStyle(key);
  },
  "outline-general": (key, geoHaveData) => {
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

  policy_status_counts: (key, geoHaveData, maxVal = 1, minVal = 0) => {
    return {
      "fill-color": [
        "case",
        ["!=", ["feature-state", key], null],
        getQuantizedColorStyle({
          colors: [
            mapGreen6,
            mapGreen5,
            mapGreen4,
            mapGreen3,
            mapGreen2,
            mapGreen1,
          ],
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
