import * as d3 from "d3/dist/d3.min";

const Util = {};

/**
 * Returns true if the object has no keys, false otherwise.
 * @method isEmpty
 * @param  {[type]}  d [description]
 * @return {Boolean}   [description]
 */
export const isEmpty = d => {
  if (d === undefined || d === null || Object.keys(d).length === 0) return true;
  else return false;
};

/**
 * Given the min and max size of the scale, and the maximum value that the
 * data takes on, returns a scale with log base 10 interpolation between the
 * min size and max size up to the max value.
 * @method getLog10Scale
 * @param  {[type]}      minSize  [description]
 * @param  {[type]}      maxSize  [description]
 * @param  {[type]}      maxValue [description]
 * @return {[type]}               [description]
 */
export const getLog10Scale = ({
  minSize,
  maxValue,
  featurePropertyKey,
  zeroSize = 0,
  totalDecadesOverride = null,
}) => {
  // divide into 5 decades ending with the maxValue
  const x = Math.log10(maxValue);

  // store interpolator breakpoints as pairs of elements:
  // 1: value
  // 2: scale value at that value
  const decades = [0, zeroSize, 1, minSize];

  // total decades to define, including for zero and 1
  const totalDecades = totalDecadesOverride || 7;

  // create decades
  for (let i = 1; i < totalDecades - 1; i++) {
    decades.push(Math.pow(10, x * (i / (totalDecades - 2))));
    decades.push(0.33 * minSize * Math.pow(2, i));
  }

  const metricZoom = [
    "interpolate",
    ["linear"],
    ["feature-state", featurePropertyKey],
    ...decades,
  ];

  // define scale factor for each map that scales fully zoomed in bubbles to
  // appear to occupy the same geographic space as fully zoomed out bubbles
  // TODO define as parameter for function, because it depends upon the min
  // and max zoom levels for the map.
  const scaleFactor = 8;
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    3.5,
    metricZoom,
    6,
    ["*", metricZoom, scaleFactor],
  ];

  // Below: former way of doing log scales without heuristic size fix
  // // return scale with decades
  // return [
  //   "interpolate",
  //   ["linear"],
  //   ["feature-state", featurePropertyKey],
  //   ...decades,
  // ];
};

/*
 * Return linear circle radius scale for Mapbox map layer paint styling.
 */
export const getLinearScale = ({
  minSize,
  maxValue,
  featurePropertyKey,
  zeroSize = 0,
}) => {
  const metricZoom = [
    "interpolate",
    ["linear"],
    ["feature-state", featurePropertyKey],
    0,
    zeroSize,
    1,
    5,
    maxValue,
    75,
  ];

  // define scale factor for each map that scales fully zoomed in bubbles to
  // appear to occupy the same geographic space as fully zoomed out bubbles
  // TODO define as parameter for function, because it depends upon the min
  // and max zoom levels for the map.
  const scaleFactor = 12;
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    3, // min zoom
    metricZoom,
    6, // max zoom
    ["*", metricZoom, scaleFactor],
  ];

  return [
    "interpolate",
    ["linear"],
    ["feature-state", featurePropertyKey],
    0,
    zeroSize,
    1,
    5,
    maxValue,
    75,
  ];

  // Below: former way of doing linear scales without heuristic size fix
  // // return linear interpolation scale
  // return [
  //   "interpolate",
  //   ["linear"],
  //   ["feature-state", featurePropertyKey],
  //   0,
  //   zeroSize,
  //   1,
  //   5,
  //   maxValue,
  //   75,
  // ];
};

/**
 * Check to see if two arrays match
 * https://gomakethings.com/how-to-check-if-two-arrays-are-equal-with-vanilla-js/
 * @method
 * @param  {[type]} arr1 [description]
 * @param  {[type]} arr2 [description]
 * @return {[type]}      [description]
 */
export const arraysMatch = function(arr1, arr2) {
  arr1.sort();
  arr2.sort();

  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) return false;

  // Check if all items exist and are in the same order
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  // Otherwise, return true
  return true;
};

// misc functions
// formatting values
export const percentize = val => {
  const fmtVal = parseFloat(val).toFixed(0) + "%";
  if (val < 1 && val > 0) return "< 1%";
  else if (val > -1 && val < 0) return "< -1%";
  else if (val > 200) return "> 200%";
  else if (val < -200) return "> -200%";
  else return fmtVal;
};

export const comma = num => {
  const resultTmp = d3.format(",.0f")(num);
  return resultTmp;
};

export const getAndListString = (arr, conjunction = "and") => {
  if (arr === undefined || arr == null || arr.length === 0) return "";
  else if (arr.length === 1) return arr[0];
  else if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;
  else {
    const first = arr.slice(0, arr.length - 1).join(", ");
    return first + ", " + conjunction + " " + arr[arr.length - 1];
  }
};

export const isLightColor = color => {
  if (color === undefined) return false;
  // Variables for red, green, blue values
  var r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  return hsp > 127.5;
};

export default Util;
