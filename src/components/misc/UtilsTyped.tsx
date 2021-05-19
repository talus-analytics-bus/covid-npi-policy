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
