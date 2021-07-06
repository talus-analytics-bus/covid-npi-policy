import moment from "moment";
import React from "react";
import { useEffect, useRef } from "react";
import { MapContext } from "react-map-gl";
// import * as d3 from "d3";
/**
 * Parses a value as a string or, if it is null or undefined, returns itself.
 * @param v The value to be parsed as a string
 * @returns The value parsed as a string, or, if it was null or
 * undefined, itself
 */
export const parseStringSafe = (
  v: number | string | null | undefined
): string | null | undefined => {
  if (v === undefined || v === null) return v;
  else return v.toString();
};

// Hook
// https://usehooks.com/usePrevious/
export const useMap = () => {
  const { map } = React.useContext(MapContext);
  return map;
};

export const removeParenthetical = (value: string) => {
  return value.replace(/\([A-Z-]*\)/, "");
};

export const parseStringAsMoment = (value: string) => {
  const valueArr: string[] = value.split(" ");
  const yyyymmdd: string = valueArr[0].replaceAll("-", "/");
  const formattedValue = `${yyyymmdd} ${valueArr.slice(1).join(" ")}`.trim();
  return moment(formattedValue);
};

export function getElHeight(ref: React.RefObject<HTMLDivElement>): number {
  if (ref !== null && ref.current !== null) {
    return ref.current.getBoundingClientRect().height;
  } else return 0;
}
export function getElWidth(ref: React.RefObject<HTMLDivElement>): number {
  if (ref !== null && ref.current !== null) {
    return ref.current.getBoundingClientRect().width;
  } else return 0;
}

// /**
//  * Given a 4- or 5-digit FIPS code, returns the code without any leading zeros.
//  *
//  * @param {string | number | undefined | null} v
//  * The 4- or 5-digit FIPS code
//  *
//  * @returns {string} The 4- or 5-digit FIPS code without leading zeros
//  */
// export function getFipsNoLeadingZero(
//   v: string | number | undefined | null
// ): string {
//   if (v === undefined || v === null) {
//     throw Error("Argument cannot be undefined or null, received " + v);
//   } else if (typeof v === "number") return v.toString();
//   else if (v.length === 5) {
//     if (v.charAt(0) === "0") return v.slice(1);
//     else return v;
//   } else if (v.length === 4) return v;
//   else throw Error("Argument was unexpected value: " + v);
// }

interface GetLog10ScaleProps {
  minSize: number;
  maxValue: number;
  featurePropertyKey: string;
  zeroSize?: number;
  totalDecadesOverride?: number | null;
}

/**
 * Given the min and max size of the scale, and the maximum value that the
 * data takes on, returns a scale with log base 10 interpolation between the
 * min size and max size up to the max value.
 * @method getLog10Scale
 */
export const getLog10Scale: Function = ({
  minSize,
  maxValue,
  featurePropertyKey,
  zeroSize = 0,
  totalDecadesOverride = null,
}: GetLog10ScaleProps): any[] => {
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

interface GetLinearScaleProps {
  minSize: number;
  maxValue: number;
  featurePropertyKey: string;
  zeroSize?: number;
  maxSize?: number;
}

/*
 * Return linear circle radius scale for Mapbox map layer paint styling.
 */
export const getLinearScale: Function = ({
  minSize,
  maxValue,
  featurePropertyKey,
  zeroSize = 0,
  maxSize = 75,
}: GetLinearScaleProps) => {
  const metricZoom = [
    "interpolate",
    ["linear"],
    ["feature-state", featurePropertyKey],
    0,
    zeroSize,
    1,
    minSize,
    maxValue,
    maxSize,
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
 * Returns the series of integers from `start` to `end`, inclusive.
 * @param {number} start The beginning of the integer range, 0 by default.
 * @param {number} end The end of the integer range.
 * @returns The array representing the integer series from the start to end of
 * the range, inclusive.
 */
export const range = (start: number = 0, end: number): number[] => {
  const base = Array.from(Array(end).keys());
  if (start !== 0) {
    return base.map(v => v + start);
  } else return base;
};

export const getEvenSteps = (
  start: number,
  end: number,
  nSteps: number = 2
): number[] => {
  // calculate size of step
  const diff: number = end - start;
  const size: number = diff / nSteps;

  // calculate steps
  const steps: number[] = [];
  for (let i: number = 0; i < nSteps - 1; i++) {
    steps.push(i * size + start);
  }
  steps.push(end);
  return steps; // TODO
};

/**
 * Returns true if the object has no keys, false otherwise.
 * @method isEmpty
 */
export const isEmpty: Function = (d: any): boolean => {
  if (d === undefined || d === null || Object.keys(d).length === 0) return true;
  else return false;
};

// /**
//  * Returns true if a value is considered valid, false otherwise.
//  * @param v The value
//  * @returns Whether the value is valid, i.e., not equal to undefined or null
//  */
// export const isValid = (v: any): boolean => {
//   return v !== undefined && v !== null;
// };

export const getAndListString = (
  arr: string[],
  conjunction: string = "and"
): string => {
  if (arr === undefined || arr == null || arr.length === 0) return "";
  else if (arr.length === 1) return arr[0];
  else if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;
  else {
    const first = arr.slice(0, arr.length - 1).join(", ");
    return first + ", " + conjunction + " " + arr[arr.length - 1];
  }
};

/**
 * Returns the input string with the first character uppercase.
 * @param s The input string
 * @returns The string with the first character uppercase
 */
export const getInitCap = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1, s.length);
};
