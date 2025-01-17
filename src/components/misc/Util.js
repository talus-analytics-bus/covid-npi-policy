import * as d3 from "d3/dist/d3.min";
import BrowserDetection from "react-browser-detection";

const Util = {};

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

export const BrowserProvider = children => (
  <BrowserDetection>{children}</BrowserDetection>
);

export const defineKeyVal = (obj, key, defaultVal) => {
  if (obj[key] === undefined) obj[key] = defaultVal;
};

export default Util;
