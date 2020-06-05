import * as d3 from "d3/dist/d3.min";

const Util = {};

/**
 * Returns true if the object has no keys, false otherwise.
 * @method isEmpty
 * @param  {[type]}  d [description]
 * @return {Boolean}   [description]
 */
export const isEmpty = d => {
  if (d === undefined || Object.keys(d).length === 0) return true;
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
  zeroSize = 0
}) => {
  // divide into 5 decades ending with the maxValue
  const x = Math.log10(maxValue);

  // store interpolator breakpoints as pairs of elements:
  // 1: value
  // 2: scale value at that value
  const decades = [0, zeroSize, 1, minSize];

  // total decades to define, including for zero and 1
  const totalDecades = 7;

  // create decades
  for (let i = 1; i < totalDecades - 1; i++) {
    decades.push(Math.pow(10, x * (i / (totalDecades - 2))));
    decades.push(minSize * Math.pow(2, i));
  }

  // return scale with decades
  return [
    "interpolate",
    ["linear"],
    ["feature-state", featurePropertyKey],
    ...decades
  ];
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

export default Util;
