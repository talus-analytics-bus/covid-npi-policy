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

// Return init lower case version of input string
export const getInitLower = str => {
  return str.charAt(0).toLowerCase() + str.slice(1, str.length);
};
export const getInitCap = str => {
  return str.charAt(0).toUpperCase() + str.slice(1, str.length);
};

export default Util;
