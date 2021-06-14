import moment from "moment";
import React from "react";
import { useEffect, useRef } from "react";
import { MapContext } from "react-map-gl";
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
export const usePrevious = (value: any) => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
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
