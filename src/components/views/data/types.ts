import { encodeString, decodeString } from "use-query-params";
// import { DataPageType, DataPageTypeVals } from "./Data";

/**
 * The different types of data page that can be viewed: `policy`, `plan`, and
 * `challenge`.
 *
 * NOTE: `challenge` is currently disabled.
 */
export const DataPageTypeVals = ["policy", "plan", "challenge"] as const;
export type DataPageType = typeof DataPageTypeVals[number];

/**
 * Get document type parameter from URL or return default
 */
// const defaultVal: DataPageType = "plan";
// export const DocTypeParamOrig = {
//   encode: (s: DataPageType | null | undefined): string | null | undefined =>
//     encodeString(s as string),

//   decode: (s: string | (string | null)[] | null | undefined): DataPageType => {
//     if (DataPageTypeVals.includes(s as DataPageType))
//       return decodeString(s) as DataPageType;
//     else if (s === undefined) return defaultVal;
//     else if (s === null) return defaultVal;
//     return defaultVal;
//   },
// };

export const DocTypeParam = getTypedStringParam<DataPageType>(
  DataPageTypeVals,
  "policy"
);

interface TypedStringParam<T> {
  encode: (s: T | null | undefined) => string | null | undefined;
  decode: (s: string | (string | null)[] | null | undefined) => T;
}
export function getTypedStringParam<T extends string>(
  valList: readonly T[],
  defaultVal: T
): TypedStringParam<T> {
  return {
    encode: (s: T | null | undefined): string | null | undefined =>
      encodeString(s as string),

    decode: (s: string | (string | null)[] | null | undefined): T => {
      if (valList.includes(s as T)) return decodeString(s) as T;
      else if (s === undefined) return defaultVal;
      else if (s === null) return defaultVal;
      return defaultVal;
    },
  };
}
